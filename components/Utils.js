export const uniqueId = () => parseInt(Date.now() * Math.random()).toString();

export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
