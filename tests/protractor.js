describe("angularjs homepage todo list", () => {
	it("should add a todo", () => {
		browser.ignoreSynchronization = true
		browser.get("http://localhost:8080/")

		const buttonTop = element(by.id("topMenuButton"))

		expect(buttonTop.getText()).toEqual("Open Top")
	})
})
