import { vec3, mat4 } from "gl-matrix"
import view from "./view"
import { removeArray, uid } from "./utils"

export default class Hierarchy {
	constructor(name = "name") {
		this.name = name
		this.id = uid()
		this.children = []
		this.parent = null

		this.position = vec3.fromValues(0.0, 0.0, 0.0)
		this.rotation = vec3.fromValues(0.0, 0.0, 0.0)
		this.scale = vec3.fromValues(1.0, 1.0, 1.0)
	}

	modelMatrix() {
		let model = mat4.create()
		if (this.parent) {
			model = this.parent.modelMatrix()
		} else if (this.camera) {
			mat4.rotateX(model, model, this.camera.rotation[0])
			mat4.rotateY(model, model, this.camera.rotation[1])
			mat4.rotateZ(model, model, this.camera.rotation[2])

			mat4.translate(model, model, this.camera.position)
		}

		mat4.translate(model, model, this.position)
		mat4.rotateX(model, model, this.rotation[0])
		mat4.rotateY(model, model, this.rotation[1])
		mat4.rotateZ(model, model, this.rotation[2])
		mat4.scale(model, model, this.scale)

		return model
	}

	removeFromChildren(object) {
		removeArray(this.children, object)
	}

	multiplyVectorWithRotation(initialVector, scale) {
		const v = initialVector

		const m = mat4.create()
		mat4.rotateX(m, m, this.rotation[0])
		mat4.rotateZ(m, m, this.rotation[2])
		mat4.rotateY(m, m, this.rotation[1])

		const newVec = vec3.fromValues(0.0, 0.0, 0.0)
		newVec[0] = (m[0] * v[0]) + (m[1] * v[1]) + (m[2] * v[2])
		newVec[1] = (m[4] * v[0]) + (m[5] * v[1]) + (m[6] * v[2])
		newVec[2] = (m[8] * v[0]) + (m[9] * v[1]) + (m[10] * v[2])

		vec3.scale(newVec, newVec, scale)
		return newVec
	}

	forward(scale) {
		return this.multiplyVectorWithRotation(
			vec3.fromValues(0.0, 0.0, 1.0), scale,
		)
	}

	right(scale) {
		return this.multiplyVectorWithRotation(
			vec3.fromValues(1.0, 0.0, 0.0), scale,
		)
	}

	up(scale) {
		return this.multiplyVectorWithRotation(
			vec3.fromValues(0.0, 1.0, 0.0), scale,
		)
	}

	setParent(newParent) {
		if (!(newParent instanceof Hierarchy)) {
			console.warn("Trying to set a parent that is not a GameObject")
			return
		}
		if (newParent === this) {
			console.warn("Parent can't be the object its self")
			return
		}
		if (newParent === this.parent) {
			console.warn("Already a parent")
			return
		}

		if (newParent.parent) {
			newParent.parent.removeFromChildren(newParent)
		}

		if (this.parent) {
			this.parent.removeFromChildren(this)
			this.parent.children.push(newParent)
		}

		newParent.parent = this.parent
		this.parent = newParent
		newParent.children.push(this)

		view.updateHierarchy()
	}

	setChild(child) {
		if (!(child instanceof Hierarchy)) {
			console.warn("Trying to add a child that is not a GameObject")
			return
		}
		if (child === this) {
			console.warn("Child can't be the object its self")
			return
		}
		if (this.children.indexOf(child) > -1) {
			console.warn("Child is already children")
			return
		}

		if (child.parent) {
			child.parent.removeFromChildren(child)
		}

		this.children.push(child)
		child.parent = this

		view.updateHierarchy()
	}

	getChilds(tag = undefined, arr = []) {
		if (tag) {
			if (this.tag === tag) {
				arr.push(this)
			}
		} else {
			arr.push(this)
		}
		this.children.forEach((child) => {
			child.getChilds(tag, arr)
		})
		return arr
	}

	findById(id) {
		let res
		this.getChilds().forEach((child) => {
			if (child.id === id && !res) {
				res = child
			}
		})
		return res

		// if (this.id === id) {
		//     return this
		// }

		// this.children.forEach((child) => {
		//     const res = child.findById(id)
		//     if (res) {
		//         return res
		//     }
		// })
		// return undefined
	}
}
