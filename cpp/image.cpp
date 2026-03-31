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

}

// use this to compile
// emcc cpp/image.cpp -o build/image.js -s EXPORTED_FUNCTIONS="['_grayscale','_sepia','_malloc','_free']" -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap' , 'HEAPU8']"