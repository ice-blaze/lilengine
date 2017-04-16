const view = {
	// Refresh the hierarchypanel
	update_hierarchy() {
		$("#gameobject_hierarchy>li").remove()
		let i = 0
		gameObjectHierarchy.forEach((gameobject) => {
			i += 1
			$("#gameobject_hierarchy").append(`<li><a name='${i}' id='${gameobject.name}'>${gameobject.name}</a></li>`)
			$("#" + gameobject.name).click((ev) => {
				selectedGameObject = gameObjectHierarchy[ev.currentTarget.name]
				view.update_inspector()
			})
		})
	},
	update_inspector() {
		$("#gameobject_inspector").empty()
		const sgo = selectedGameObject
		const decimal = 4
		if (sgo) {
			$("#gameobject_inspector").append(
				`${sgo.name}<br>
				position: <br>
				x: ${sgo.position[0].toFixed(decimal)}<br>
				y: ${sgo.position[1].toFixed(decimal)}<br>
				z: ${sgo.position[2].toFixed(decimal)}<br>
				rotation: <br>
				x: ${sgo.rotate[0].toFixed(decimal)}<br>
				y: ${sgo.rotate[1].toFixed(decimal)}<br>
				z: ${sgo.rotate[2].toFixed(decimal)}<br>
				scale: <br>
				x: ${sgo.scale[0].toFixed(decimal)}<br>
				y: ${sgo.scale[1].toFixed(decimal)}<br>
				z: ${sgo.scale[2].toFixed(decimal)}<br>`
			)
		} else {
			$("#gameobject_inspector").append("None")
		}
	},
}

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

	view.update_inspector()
})

$(document).ready(() => {
	setInterval(view.update_inspector, 1000)
})
