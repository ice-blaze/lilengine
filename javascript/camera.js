import view from "./view"
import Hierarchy from "./hierarchy"
import { removeArray } from "./utils"

export default class Camera extends Hierarchy {
	constructor(gl, name = "name") {
		super(name)

		this.yFov = 80
	}

	removeFromChildren(object) {
		removeArray(this.children, object)
	}

	setParent(newParent) {
		// TODO create class Hierarchy with adding and removing childs
		// if (!(newParent instanceof GameObject)) {
		//     console.warn("Trying to set a parent that is not a GameObject")
		//     return
		// }
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
		// TODO create class Hierarchy with adding and removing childs
		// if (!(child instanceof GameObject)) {
		//     console.warn("Trying to add a child that is not a GameObject")
		//     return
		// }
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
}
