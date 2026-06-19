CC=emcc
CPPFLAGS=-g3 -O0 -std=c++17
CWD=$(abspath $(lastword $(MAKEFILE_LIST)))
CXX=gcc
EMCC_CFLAGS=-s WASM=1 -s ENVIRONMENT=web,node -s WASM_BIGINT -s DISABLE_EXCEPTION_CATCHING=0 -s EXIT_RUNTIME=0 -s NO_EXIT_RUNTIME=1 -s ASSERTIONS=1 -Wall -s MODULARIZE=1 -s ERROR_ON_UNDEFINED_SYMBOLS=0 --bind -s EXPORTED_FUNCTIONS="[_malloc, _main]" -DEMSCRIPTEN
#OBJS=*.o *.html *.js *.wasm
OBJS=.*\.\(obj\|wasm\)
RM=find . \( -name "*.o"  -o -name "*.obj" -o -name "*.wasm" -o -name "*.js" \) -type f -delete

.PHONY: all clean test

compile: \
	IndicatorTest.o IndicatorTest.js
	#TaskRunner.o TaskRunner.js \
	#classes/Task/tests/Task.test.o classes/Task/tests/Task.test.js \
	#classes/Task/tests/Taskable.test.o classes/Task/tests/Taskable.test.js \
	#classes/Task/tests/TaskAction.test.o classes/Task/tests/TaskAction.test.js \
	#classes/Task/tests/TaskActionBase.test.o classes/Task/tests/TaskActionBase.test.js \
	#classes/Task/tests/TaskCondition.test.o classes/Task/tests/TaskCondition.test.js \
	#classes/Task/tests/TaskConditionBase.test.o classes/Task/tests/TaskConditionBase.test.js \
	#classes/Task/tests/TaskGetter.test.o classes/Task/tests/TaskGetter.test.js \
    #classes/Task/tests/TaskGetterBase.test.o classes/Task/tests/TaskGetterBase.test.js \
	#classes/Task/tests/TaskManager.test.o classes/Task/tests/TaskManager.test.js \
	#classes/Task/tests/TaskObject.test.o classes/Task/tests/TaskObject.test.js \
	#classes/Task/tests/TaskSetter.test.o classes/Task/tests/TaskSetter.test.js

%.js: %.cpp
	$(CC) $(EMCC_CFLAGS) $(CFLAGS) $(CPPFLAGS) $< -o $@

%.o: %.cpp
	$(CXX) $(CFLAGS) $(CPPFLAGS) -c $<

clean:
	$(RM)
