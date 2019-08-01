describe("Verify the UI", () => {
	beforeEach(() => {
		browser.ignoreSynchronization = true
		browser.get("http://localhost:8329/")
	})

	function checkPanelButtons(buttonID, panelID) {
		const button = element(by.id(buttonID))
		const panel = element(by.id(panelID))

		panel.isDisplayed().then((isVisible) => {
			if (isVisible) {
				button.click()
				browser.sleep(1000) // should wait until invisible more than just wait
				panel.isDisplayed().then((isVisibleAfter) => {
					expect(isVisibleAfter).toBeFalsy()
				})
			} else {
				button.click()
				browser.sleep(1000) // should wait until invisible more than just wait
				panel.isDisplayed().then((isVisibleAfter) => {
					expect(isVisibleAfter).toBeTruthy()
				})
			}
		})
	}

	it("should open and close the top panel", () => {
		checkPanelButtons("topMenuButton", "topMenu")
		checkPanelButtons("topMenuButton", "topMenu")
	})

	it("should open and close the right panel", () => {
		checkPanelButtons("rightMenuButton", "rightMenu")
		checkPanelButtons("rightMenuButton", "rightMenu")
	})

	it("should open and close the left panel", () => {
		checkPanelButtons("leftMenuButton", "leftMenu")
		checkPanelButtons("leftMenuButton", "leftMenu")
	})
})
