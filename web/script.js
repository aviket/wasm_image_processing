var wasmModule = null;

Module.onRuntimeInitialized = () => {
    console.log("WASM Ready ✅");
    wasmModule = Module;
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

document.getElementById("upload").addEventListener("change", (e) => {
    const img = new Image();
    img.src = URL.createObjectURL(e.target.files[0]);

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };
});

function applyGrayscale() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const ptr = wasmModule._malloc(data.length);
    wasmModule.HEAPU8.set(data, ptr);

    wasmModule._grayscale(ptr, data.length);

    const result = wasmModule.HEAPU8.subarray(ptr, ptr + data.length);
    imageData.data.set(result);

    ctx.putImageData(imageData, 0, 0);

    wasmModule._free(ptr);
}

document.getElementById("grayscaleBtn").addEventListener("click", () => {

    if (!wasmModule) {
        alert("WASM not loaded yet");
        return;
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const ptr = wasmModule._malloc(data.length);
    wasmModule.HEAPU8.set(data, ptr);

    wasmModule._grayscale(ptr, data.length);

    const result = wasmModule.HEAPU8.subarray(ptr, ptr + data.length);
    imageData.data.set(result);

    ctx.putImageData(imageData, 0, 0);

    wasmModule._free(ptr);
});