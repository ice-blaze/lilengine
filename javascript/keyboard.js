import { vec3 } from "gl-matrix"

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

		const translationSpeed = 0.1 // TODO multiply with a delta
		const rotationSpeed = -0.01 // TODO multiply with a delta
		const pi = 3.14
		const halfPi = pi / 2.0

		setInterval(() => {
			// Translation part
			if (this.keypressed.w) {
				vec3.add(
					this.camera.position,
					this.camera.position,
					this.camera.forward(translationSpeed),
				)
			}

			if (this.keypressed.s) {
				vec3.sub(
					this.camera.position,
					this.camera.position,
					this.camera.forward(translationSpeed),
				)
			}

			if (this.keypressed.q) {
				vec3.sub(
					this.camera.position,
					this.camera.position,
					this.camera.right(translationSpeed),
				)
			}

			if (this.keypressed.e) {
				vec3.add(
					this.camera.position,
					this.camera.position,
					this.camera.right(translationSpeed),
				)
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
				this.camera.rotation[0] = Math.max(this.camera.rotation[0], -halfPi)
			}

			if (this.keypressed.ArrowDown) {
				this.camera.rotation[0] -= rotationSpeed
				this.camera.rotation[0] = Math.min(this.camera.rotation[0], halfPi)
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
