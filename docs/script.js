var wasmModule = null;
let historyStack = [];
let redoStack = [];
const MAX_HISTORY = 10;

Module.onRuntimeInitialized = () => {
    console.log("WASM Ready ✅");
    wasmModule = Module;
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

document.getElementById("upload").addEventListener("change", (e) => {
    const img = new Image();
    img.src = URL.createObjectURL(e.target.files[0]);

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        historyStack = []; // reset history
        redoStack = [];
        saveState();       // initial state
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
    saveState();
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

document.getElementById("sepiaBtn").addEventListener("click", () => {

    if (!wasmModule) {
        alert("WASM not loaded yet");
        return;
    }
    saveState();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const ptr = wasmModule._malloc(data.length);
    wasmModule.HEAPU8.set(data, ptr);

    wasmModule._sepia(ptr, data.length);

    const result = wasmModule.HEAPU8.subarray(ptr, ptr + data.length);
    imageData.data.set(result);

    ctx.putImageData(imageData, 0, 0);

    wasmModule._free(ptr);
});

const blurSlider = document.getElementById("blurSlider");
const blurValue = document.getElementById("blurValue");

let blurRadius = 1;

blurSlider.addEventListener("input", () => {
    blurRadius = parseInt(blurSlider.value);
    blurValue.textContent = blurRadius;
});

document.getElementById("blurBtn").addEventListener("click", () => {

    if (!wasmModule) return;
    saveState();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const ptr = wasmModule._malloc(data.length);
    wasmModule.HEAPU8.set(data, ptr);

    // 👇 pass radius now
    wasmModule._blur(ptr, canvas.width, canvas.height, blurRadius);

    const result = wasmModule.HEAPU8.subarray(ptr, ptr + data.length);
    imageData.data.set(result);

    ctx.putImageData(imageData, 0, 0);

    wasmModule._free(ptr);
});

document.getElementById("downloadBtn").addEventListener("click", () => {

    // Convert canvas → image
    const dataURL = canvas.toDataURL("image/png");

    // Create temporary download link
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "edited-image.png";

    // Trigger download
    link.click();
});

function saveState() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    historyStack.push(new Uint8ClampedArray(imageData.data));

    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
    }

    // 🔥 NEW: clear redo on new action
    redoStack = [];
}

document.getElementById("undoBtn").addEventListener("click", () => {

    if (historyStack.length === 0) return;

    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Move current → redo stack
    redoStack.push(new Uint8ClampedArray(current.data));

    const previous = historyStack.pop();

    current.data.set(previous);
    ctx.putImageData(current, 0, 0);
});

document.getElementById("redoBtn").addEventListener("click", () => {

    if (redoStack.length === 0) return;

    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Move current → undo stack
    historyStack.push(new Uint8ClampedArray(current.data));

    const next = redoStack.pop();

    current.data.set(next);
    ctx.putImageData(current, 0, 0);
});