export default class Keyboard {
	constructor(camera) {
		this.camera = camera
		this.keypressed = {}

		document.addEventListener("keydown", (event) => {
			const keyName = event.key
			this.keypressed[keyName] = true
		}, false)

		document.addEventListener("keyup", (event) => {
			const keyName = event.key
			this.keypressed[keyName] = false
		}, false)

		setInterval(() => {
			if (this.keypressed.w) {
				this.camera.position[2] += 0.1 // TODO multiply with a delta
			}

			if (this.keypressed.s) {
				this.camera.position[2] -= 0.1 // TODO multiply with a delta
			}

			if (this.keypressed.q) {
				this.camera.position[0] -= 0.1 // TODO multiply with a delta
			}

			if (this.keypressed.e) {
				this.camera.position[0] += 0.1 // TODO multiply with a delta
			}

			if (this.keypressed.a) {
				this.camera.position[1] -= 0.1 // TODO multiply with a delta
			}

			if (this.keypressed[" "]) {
				this.camera.position[1] += 0.1 // TODO multiply with a delta
			}
		}, 1)
	}
}
