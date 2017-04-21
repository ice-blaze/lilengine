export function removeArray(array, object) {
	const i = array.indexOf(object)
	if (i !== -1) {
		array.splice(i, 1)
	}
}

// Load synchronously the shaders. It's slower(0.5s) but code is more readable
export function loadTextFile(url) {
	const request = new XMLHttpRequest()
	request.open("GET", url, false)
	request.send()
	return request.responseText
}
