// https://gist.github.com/borismus/1032746

const BASE64_MARKER = ";base64,";

function convertDataURIToBinary(dataURI: string): Uint8Array {
  const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  const base64 = dataURI.substring(base64Index);
  const raw = window.atob(base64);
  const rawLength = raw.length;
  const array = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

function testLog(): void {
  console.log("test");
}

export { convertDataURIToBinary, testLog };
