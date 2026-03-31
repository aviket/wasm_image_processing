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

}

// use this to compile
// emcc cpp/image.cpp -o build/image.js -s EXPORTED_FUNCTIONS="['_grayscale','_malloc','_free']" -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap' , 'HEAPU8']"