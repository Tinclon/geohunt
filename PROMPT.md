# LLM Prompt

Here is the inital LLM prompt fed into Cursor IDE to generate this project and code:


```
Create a react website for the following 'game':

1. The user should be able to select between two modes: 'hawk' or 'bluebird'
2. In either case, after making the selection, the user should be presented with a page displaying:
  - Their own mode (either 'hawk' or 'bluebird')
  - Their own current GPS coordinates (using the browser's location API)
  - The GPS coordinates of their opponent (as received from a web service - just create a stub for this for now)
3. Once every 5 minutes, the website should refresh with:
  - The user's own new GPS coordinates
  - The new GPS coordinates of their opponent (as received from a web service - just create a stub for this for now)
4. The site should be in 'dark' mode theme, with large, easy to read, high contrast text.
5. The site should display well on an iPad mini in landscape mode
6. If the user and their opponent are within 200 meters of each other, a flashing warning text should appear.
```
