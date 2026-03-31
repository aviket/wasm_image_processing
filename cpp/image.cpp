#include <emscripten.h>
#include <stdint.h>

// Expose function to JS
extern "C" {

EMSCRIPTEN_KEEPALIVE
void grayscale(uint8_t* data, int length) {
    for (int i = 0; i < length; i += 4) {
        uint8_t r = data[i];
        uint8_t g = data[i + 1];
        uint8_t b = data[i + 2];

        uint8_t gray = (r + g + b) / 3;

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
}

EMSCRIPTEN_KEEPALIVE
void sepia(uint8_t* data, int length) {
    for (int i = 0; i < length; i += 4) {
        uint8_t r = data[i];
        uint8_t g = data[i + 1];
        uint8_t b = data[i + 2];

        uint8_t newR = (uint8_t)((0.393 * r + 0.769 * g + 0.189 * b) > 255 ? 255 : (0.393 * r + 0.769 * g + 0.189 * b));
        uint8_t newG = (uint8_t)((0.349 * r + 0.686 * g + 0.168 * b) > 255 ? 255 : (0.349 * r + 0.686 * g + 0.168 * b));
        uint8_t newB = (uint8_t)((0.272 * r + 0.534 * g + 0.131 * b) > 255 ? 255 : (0.272 * r + 0.534 * g + 0.131 * b));

        data[i] = newR;
        data[i + 1] = newG;
        data[i + 2] = newB;
    }
}

// NEW: Blur filter
EMSCRIPTEN_KEEPALIVE
void blur(uint8_t* data, int width, int height, int radius) {

    int size = width * height * 4;
    uint8_t* temp = new uint8_t[size];

    // Copy original
    for (int i = 0; i < size; i++) temp[i] = data[i];

    int kernelSize = (2 * radius + 1) * (2 * radius + 1);

    for (int y = radius; y < height - radius; y++) {
        for (int x = radius; x < width - radius; x++) {

            int r = 0, g = 0, b = 0;

            for (int dy = -radius; dy <= radius; dy++) {
                for (int dx = -radius; dx <= radius; dx++) {

                    int idx = ((y + dy) * width + (x + dx)) * 4;

                    r += temp[idx];
                    g += temp[idx + 1];
                    b += temp[idx + 2];
                }
            }

            int idx = (y * width + x) * 4;

            data[idx]     = r / kernelSize;
            data[idx + 1] = g / kernelSize;
            data[idx + 2] = b / kernelSize;
        }
    }

    delete[] temp;
}


}

// use this to compile
// emcc cpp/image.cpp -o build/image.js -s EXPORTED_FUNCTIONS="['_grayscale','_sepia','_malloc','_free']" -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap' , 'HEAPU8']"