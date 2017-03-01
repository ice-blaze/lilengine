const view = {
	// Refresh the hierarchypanel
	update_hierarchy() {
		$("#gameobject_hierarchy>li").remove()
		for (gameobject of gameobject_hierarchy) {
			$("#gameobject_hierarchy").append("<li><a href='#'>" + gameobject.name + "</a></li>")
		}
	},
}

// Add events on the panels button to show and hide them
const menu_appearing_time = 500

$(document).ready(() => {
	$("#leftMenuButton").click(() => {
		$("#leftMenu").toggle("slide", {
			direction: 'left'
		}, menu_appearing_time)
	})
	$("#topMenuButton").click(() => {
		$("#topMenu").toggle("slide", {
			direction: 'up'
		}, menu_appearing_time)
	})
	$("#rightMenuButton").click(() => {
		$("#rightMenu").toggle("slide", {
			direction: 'right'
		}, menu_appearing_time)
	})
})