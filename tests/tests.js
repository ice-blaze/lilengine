// Simple testing
// TODO should use a framework

// first test
{
	const gameobject1 = new GameObject("gameobject1")
	const gameobject2 = new GameObject("gameobject2")
	const gameobject3 = new GameObject("gameobject3")
	const gameobject4 = new GameObject("gameobject4")
	const gameobject5 = new GameObject("gameobject5")

	gameobject2.set_parent(gameobject1)
	gameobject1.set_child(gameobject3)
	gameobject3.set_child(gameobject4)
	gameobject3.set_child(gameobject5)

	if (gameobject1.parent !== null) {
		console.error("Nope")
	}
	if (gameobject2.parent !== gameobject1) {
		console.error("Nope")
	}
	if (gameobject1.children[0] !== gameobject2) {
		console.error("Nope")
	}
	if (gameobject3.children[0] !== gameobject4) {
		console.error("Nope")
	}

	gameobject2.set_parent(gameobject3)
	gameobject1.set_child(gameobject3)
	gameobject2.set_parent(gameobject3)

	if (gameobject1.children[0] !== gameobject3) {
		console.error("Nope")
	}
	if (gameobject3.parent !== gameobject1) {
		console.error("Nope")
	}
	if (gameobject2.parent !== gameobject3) {
		console.error("Nope")
	}
}
