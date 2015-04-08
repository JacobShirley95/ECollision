PATH = ecollision/engine/*.js ecollision/math/*.js ecollision/objects/*.js ecollision/ui/*.js  ecollision/*.js *.js

OUTPUT_FOLDER = bin
OUTPUT_FILE = build.js

OUTPUT = $(OUTPUT_FOLDER)/$(OUTPUT_FILE)

COMPILE_CMD = $(shell ./compressJS/compressjs.sh $(PATH) $(OUTPUT))

compile: 
	@echo "Compiling..."
	$(shell mkdir -p "$(OUTPUT_FOLDER)")
	$(COMPILE_CMD)

clean:
	$(shell rm $(OUTPUT))