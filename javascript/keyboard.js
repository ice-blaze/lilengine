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

		const translationSpeed = 0.1  // TODO multiply with a delta
		const rotationSpeed = -0.001  // TODO multiply with a delta

		setInterval(() => {
			// Translation part
			// TODO move front and not based on X, forward = 1,0,0 + rotation
			if (this.keypressed.w) {
				this.camera.position[2] += translationSpeed
			}

			if (this.keypressed.s) {
				this.camera.position[2] -= translationSpeed
			}

			if (this.keypressed.q) {
				this.camera.position[0] -= translationSpeed
			}

			if (this.keypressed.e) {
				this.camera.position[0] += translationSpeed
			}

			if (this.keypressed.a) {
				this.camera.position[1] -= translationSpeed
			}

			if (this.keypressed[" "]) {
				this.camera.position[1] += translationSpeed
			}

			// Rotation part
			if (this.keypressed.ArrowUp) {
				this.camera.rotation[0] += rotationSpeed
			}

			if (this.keypressed.ArrowDown) {
				this.camera.rotation[0] -= rotationSpeed
			}

			if (this.keypressed.ArrowLeft) {
				this.camera.rotation[1] -= rotationSpeed
			}

			if (this.keypressed.ArrowRight) {
				this.camera.rotation[1] += rotationSpeed
			}
		}, 1)
	}
}
