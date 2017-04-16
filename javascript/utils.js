function remove_array(array, object) {
	const i = array.indexOf(object);
	if (i != -1) {
		array.splice(i, 1);
	}
}