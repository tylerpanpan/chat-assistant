export function getUrlParams (url: string) {
	const u = new URL(url);
	const s = new URLSearchParams(u.search);
	const obj: any = {};
	s.forEach((v, k) => (obj[k] = v));
	return obj;
}