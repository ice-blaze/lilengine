import $ from "jquery"
import "nestedSortable"
import GLB from "./main"

const view = {
	// Refresh the hierarchypanel
	updateHierarchy() {
		$("#gameobjectHierarchy>li").remove()

		// slice to remove the root element that should not be displayed into the hierarchy
		function appendGameObject(root, gameobject) {
			$(`ul${root}`).append(`<li><a name='${gameobject.id}' id='${gameobject.name}'>${gameobject.name}</a><ul id="${gameobject.id}"></ul></li>`)
			$(`a[name=${gameobject.id}]`).click((ev) => {
				GLB.selectedGameObject = GLB.gameObjectHierarchyRoot.findById(ev.currentTarget.name)
				view.updateInspector()
			})

			gameobject.children.forEach((child) => {
				appendGameObject(`#${gameobject.id}`, child)
			})
		}

		GLB.gameObjectHierarchyRoot.children.forEach((gameobject) => {
			appendGameObject("#gameobjectHierarchy", gameobject)
		})

		$("#gameobjectHierarchy").nestedSortable({
			handle: "a",
			items: "li",
			toleranceElement: "> a",
			listType: "ul",
		})
	},
	updateInspector() {
		$("#gameobjectInspector").empty()
		const sgo = GLB.selectedGameObject
		const decimal = 4
		if (sgo) {
			$("#gameobjectInspector").append(`
				${sgo.name}<br>
				position: <br>
				x: ${sgo.position[0].toFixed(decimal)}<br>
				y: ${sgo.position[1].toFixed(decimal)}<br>
				z: ${sgo.position[2].toFixed(decimal)}<br>
				rotation: <br>
				x: ${sgo.rotation[0].toFixed(decimal)}<br>
				y: ${sgo.rotation[1].toFixed(decimal)}<br>
				z: ${sgo.rotation[2].toFixed(decimal)}<br>
				scale: <br>
				x: ${sgo.scale[0].toFixed(decimal)}<br>
				y: ${sgo.scale[1].toFixed(decimal)}<br>
				z: ${sgo.scale[2].toFixed(decimal)}<br>
			`)
		} else {
			$("#gameobjectInspector").append("None")
		}
	},
}
export default view

// Add events on the panels button to show and hide them
const menuAppearingTime = 500

$(document).ready(() => {
	$("#leftMenuButton").click(() => {
		$("#leftMenu").toggle("slide", {
			direction: "left",
		}, menuAppearingTime)
	})

	$("#topMenuButton").click(() => {
		$("#topMenu").toggle("slide", {
			direction: "up",
		}, menuAppearingTime)
	})

	$("#rightMenuButton").click(() => {
		$("#rightMenu").toggle("slide", {
			direction: "right",
		}, menuAppearingTime)
	})

	view.updateInspector()
})

$(document).ready(() => {
	setInterval(view.updateInspector, 1000)
})

$("#general_speed").on("input", () => {
	const val = $("#general_speed").val()

	$("#r_speed").val(val)
	$("#g_speed").val(val)
	$("#b_speed").val(val)
})

// Top menu hiding showing PART

function hideMenus(menus) {
	menus.forEach((menu) => {
		$(menu).hide()
	})
}

function openMenu(menuId, menus) {
	hideMenus(menus)
	$(menuId).show()
}

function extractDict(dictArray, key) {
	return dictArray.map(dict => dict[key])
}

const topMenuButtons = [
	{ menu: "#depthMenu", button: "#depthButton" },
	{ menu: "#chromaticMenu", button: "#chromaticButton" },
	{ menu: "#3dMeshesMenu", button: "#3dMeshesButton" },
]

hideMenus(extractDict(topMenuButtons, "menu"))

$(document).ready(() => {
	topMenuButtons.forEach((butMen) => {
		$(butMen.button).click(() => {
			console.log("coucou")
			openMenu(butMen.menu, extractDict(topMenuButtons, "menu"))
		})
	})
})
