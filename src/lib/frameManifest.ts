const PUBLIC_BASE_URL = import.meta.env.BASE_URL;

export function getBundledFrameUrl(folder: string, filename: string): string {
	return `${PUBLIC_BASE_URL}frames/${folder}/${filename}`;
}
