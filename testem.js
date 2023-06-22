module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: [
    "Chrome"
  ],
  launch_in_dev: [
    "Chrome"
  ],
  browser_args: {
    Chrome: {
<<<<<<< HEAD
      mode: 'ci',
      args: [
        '--disable-gpu',
        '--headless',
        '--remote-debugging-port=9222',
=======
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900'
>>>>>>> d31eb24 (v3.1.4...v3.2.0)
      ].filter(Boolean)
    }
  }
};
