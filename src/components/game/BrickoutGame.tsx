import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active: boolean;
  health: number;
}

interface InputState {
  keyboard: { left: boolean; right: boolean };
  touch: { left: boolean; right: boolean };
  tilt: number; // -1 to 1, where -1 is left tilt and 1 is right tilt
}

export const BrickoutGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paddleRef = useRef<{ x: number; width: number; targetX: number }>({ 
    x: 0, 
    width: 100,
    targetX: 0 
  });
  const ballRef = useRef<{ x: number; y: number; dx: number; dy: number; radius: number }>({
    x: 0,
    y: 0,
    dx: 4,
    dy: -4,
    radius: 10
  });
  const bricksRef = useRef<Brick[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const levelRef = useRef<number>(1);
  const inputRef = useRef<InputState>({
    keyboard: { left: false, right: false },
    touch: { left: false, right: false },
    tilt: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getRandomBallDirection = () => {
      // Generate random angle between -60 and 60 degrees (in radians)
      const angle = (Math.random() * 120 - 60) * (Math.PI / 180);
      const speed = 4;
      return {
        dx: Math.sin(angle) * speed,
        dy: -Math.cos(angle) * speed // Negative because y increases downward
      };
    };

    // Set canvas size to fill container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Reset game elements on resize
      const centerX = (canvas.width - 100) / 2;
      paddleRef.current = {
        x: centerX,
        width: 100,
        targetX: centerX
      };
      const { dx, dy } = getRandomBallDirection();
      ballRef.current = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        dx,
        dy,
        radius: 10
      };
      initBricks();
    };

    // Initialize bricks
    const initBricks = () => {
      const brickRowCount = 4 + levelRef.current;
      const brickWidth = 75;
      const brickHeight = 20;
      const brickPadding = 10;
      const brickOffsetTop = 30;
      
      const availableWidth = canvas.width - (2 * brickPadding);
      const brickColumnCount = Math.floor(availableWidth / (brickWidth + brickPadding));
      
      const totalBricksWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
      const brickOffsetLeft = (canvas.width - totalBricksWidth) / 2;

      // Generate vibrant colors for each row using a better color distribution
      const rowColors = Array.from({ length: brickRowCount }, (_, i) => {
        // Use a combination of hue rotation and complementary colors
        const baseHue = (i * 60) % 360; // 60-degree steps for good color separation
        const saturation = 85 + (i % 2) * 15; // Alternate between 85% and 100% saturation
        const lightness = 45 + (i % 3) * 5; // Vary lightness between 45% and 55%
        return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
      });

      bricksRef.current = [];
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const health = levelRef.current;
          bricksRef.current.push({
            x: brickOffsetLeft + c * (brickWidth + brickPadding),
            y: brickOffsetTop + r * (brickHeight + brickPadding),
            width: brickWidth,
            height: brickHeight,
            color: rowColors[r],
            active: true,
            health
          });
        }
      }
    };

    // Draw functions
    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(paddleRef.current.x, canvas.height - 20, paddleRef.current.width, 10);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = () => {
      bricksRef.current.forEach(brick => {
        if (brick.active) {
          ctx.beginPath();
          ctx.rect(brick.x, brick.y, brick.width, brick.height);
          // Convert HSL to RGB for proper opacity handling
          const [h, s, l] = brick.color.match(/\d+/g)!.map(Number);
          const opacity = 0.4 + (brick.health / levelRef.current) * 0.6;
          ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
          ctx.fill();
          ctx.closePath();
        }
      });
    };

    // Collision detection
    const collisionDetection = () => {
      let allBricksCleared = true;
      
      bricksRef.current.forEach(brick => {
        if (brick.active) {
          allBricksCleared = false;
          if (
            ballRef.current.x > brick.x &&
            ballRef.current.x < brick.x + brick.width &&
            ballRef.current.y > brick.y &&
            ballRef.current.y < brick.y + brick.height
          ) {
            ballRef.current.dy = -ballRef.current.dy;
            brick.health--;
            if (brick.health <= 0) {
              brick.active = false;
            }
          }
        }
      });

      // Check if all bricks are cleared
      if (allBricksCleared) {
        levelRef.current++;
        initBricks();
        // Reset ball position and give new random direction
        ballRef.current.x = canvas.width / 2;
        ballRef.current.y = canvas.height - 30;
        const { dx, dy } = getRandomBallDirection();
        ballRef.current.dx = dx;
        ballRef.current.dy = dy;
      }
    };

    // Update paddle position based on input priority
    const updatePaddlePosition = () => {
      const paddleSpeed = 20;
      const smoothingFactor = 0.2;
      
      // Determine target position based on input priority
      let targetX = paddleRef.current.x;
      
      // 1. Keyboard input (highest priority)
      if (inputRef.current.keyboard.left) {
        targetX = Math.max(0, paddleRef.current.x - paddleSpeed);
      } else if (inputRef.current.keyboard.right) {
        targetX = Math.min(canvas.width - paddleRef.current.width, paddleRef.current.x + paddleSpeed);
      }
      // 2. Touch input (second priority)
      else if (inputRef.current.touch.left) {
        targetX = Math.max(0, paddleRef.current.x - paddleSpeed);
      } else if (inputRef.current.touch.right) {
        targetX = Math.min(canvas.width - paddleRef.current.width, paddleRef.current.x + paddleSpeed);
      }
      // 3. Tilt input (lowest priority)
      else if (Math.abs(inputRef.current.tilt) > 0.1) {
        const tiltSpeed = paddleSpeed * Math.abs(inputRef.current.tilt);
        targetX = paddleRef.current.x + (tiltSpeed * inputRef.current.tilt);
        targetX = Math.max(0, Math.min(canvas.width - paddleRef.current.width, targetX));
      }

      // Smoothly move paddle to target position
      paddleRef.current.x += (targetX - paddleRef.current.x) * smoothingFactor;
    };

    // Game loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updatePaddlePosition();
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Ball movement
      if (
        ballRef.current.x + ballRef.current.dx > canvas.width - ballRef.current.radius ||
        ballRef.current.x + ballRef.current.dx < ballRef.current.radius
      ) {
        ballRef.current.dx = -ballRef.current.dx;
      }
      if (ballRef.current.y + ballRef.current.dy < ballRef.current.radius) {
        ballRef.current.dy = -ballRef.current.dy;
      } else if (ballRef.current.y + ballRef.current.dy > canvas.height - ballRef.current.radius) {
        if (
          ballRef.current.x > paddleRef.current.x &&
          ballRef.current.x < paddleRef.current.x + paddleRef.current.width
        ) {
          ballRef.current.dy = -ballRef.current.dy;
        } else {
          // Game over
          ballRef.current.x = canvas.width / 2;
          ballRef.current.y = canvas.height - 30;
          const { dx, dy } = getRandomBallDirection();
          ballRef.current.dx = dx;
          ballRef.current.dy = dy;
          initBricks();
        }
      }

      ballRef.current.x += ballRef.current.dx;
      ballRef.current.y += ballRef.current.dy;

      animationRef.current = requestAnimationFrame(draw);
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        inputRef.current.keyboard.left = true;
      }
      if (e.key === 'ArrowRight') {
        inputRef.current.keyboard.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        inputRef.current.keyboard.left = false;
      }
      if (e.key === 'ArrowRight') {
        inputRef.current.keyboard.right = false;
      }
    };

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const halfWidth = canvas.width / 2;

      if (touchX < halfWidth) {
        inputRef.current.touch.left = true;
        inputRef.current.touch.right = false;
      } else {
        inputRef.current.touch.left = false;
        inputRef.current.touch.right = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      inputRef.current.touch.left = false;
      inputRef.current.touch.right = false;
    };

    // Device tilt controls
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      
      // Use gamma (left/right tilt) for paddle movement
      // Normalize to -1 to 1 range
      const tilt = Math.max(-1, Math.min(1, e.gamma / 45));
      inputRef.current.tilt = tilt;
    };

    // Initialize
    levelRef.current = 1;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    draw();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.2)',
          touchAction: 'none' // Prevent default touch actions
        }}
      />
    </Box>
  );
}; 