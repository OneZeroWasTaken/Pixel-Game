function rand(min, max) {   // Randomization function
	return Math.round(Math.random() * (max - min) + min);
}

function findPath(start, end, option) {   // Finds the shortest path between two coordinates, start[x, y] and end[x, y]
    var queue = [[end[0], end[1], 0]];
    var list = [];
    var iteration = 0;   // Iteration is the number of queue-items has been checked. Used to determine where used items is separated by to-be-checked ones in the queue array
    var map = [];

    for (var i = level.effectiveSize[0]; i < level.effectiveSize[2]; i++) {
        map[i - level.effectiveSize[0]] = [];
        for (var j = level.effectiveSize[1]; j < level.effectiveSize[3]; j++) {
            map[i - level.effectiveSize[0]][j - level.effectiveSize[1]] = -1;
        }
    }

    while (iteration < queue.length) {

        list[0] = [queue[iteration][0], queue[iteration][1] + 1, queue[iteration][2] + 1];   // The list variable holds all positions next to the [iteration] item in the queue. Whatever the index was gets increased by one
        list[1] = [queue[iteration][0] - 1, queue[iteration][1], queue[iteration][2] + 1];
        list[2] = [queue[iteration][0], queue[iteration][1] - 1, queue[iteration][2] + 1];
        list[3] = [queue[iteration][0] + 1, queue[iteration][1], queue[iteration][2] + 1];

        for (var i = 0; i < list.length; i++) {   // Check each item in the list if it is 1: A non-passable tile (wall) 2: Already used in the list before
            if (level.content[list[i][0]][list[i][1]][0] == 1) {   // If level content [list 0][list 1][0] is a wall
                list.splice(i, 1);
                i--;
            } else {
                for (var j = 0; j < queue.length; j++) {   // Each item in the list list is compared to all queue items that has already been checked: x = x, y = y, i = i
                    if (list[i][0] == queue[j][0] && list[i][1] == queue[j][1] && list[i][2] >= queue[j][2]) {
                        list.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }
        for (var i = 0; i < list.length; i++) {   // Add all items still on the list to the end of the queue
            queue.push(list[i]);
        }

        map[queue[iteration][0] - level.effectiveSize[0]][queue[iteration][1] - level.effectiveSize[1]] = queue[iteration][2];   // Add the index value to the coordinates of the current tile in the map array

        /*if (option == "door" && level.content[queue[iteration][0]][queue[iteration]][0] == 5) {   // Finds the nearest door
            break;
        } else*/ if (queue[iteration][0] == start[0] && queue[iteration][1] == start[1]) {   // Check if the start position has been reached
            break;
        }
        iteration++;
    }
    var path = [];   // Holds the path in directions to take from the start to end
    var index = queue[iteration][2];   // The distance value (queue[x][2]) is compared to each other companion tile

    currentPos = [start[0], start[1]];
    
    for (var i = 0; i < queue[iteration][2]; i++) {

        if (map[currentPos[0] - level.effectiveSize[0]][currentPos[1] - level.effectiveSize[1] + 1] < index && map[currentPos[0] - level.effectiveSize[0]][currentPos[1] - level.effectiveSize[1] + 1] >= 0) {   // If the index of the tile below currentPos is lower, take that path
            index = map[currentPos[0] - level.effectiveSize[0]][currentPos[1] - level.effectiveSize[1] + 1];
            var directionToAdd = 0;
        }
        if (map[currentPos[0] - level.effectiveSize[0] - 1][currentPos[1] - level.effectiveSize[1]] < index && map[currentPos[0] - level.effectiveSize[0] - 1][currentPos[1] - level.effectiveSize[1]] >= 0) {   // To the left
            index = map[currentPos[0] - level.effectiveSize[0] - 1][currentPos[1] - level.effectiveSize[1]];
            var directionToAdd = 1;
        }
        if (map[currentPos[0] - level.effectiveSize[0]][currentPos[1] - level.effectiveSize[1] - 1] < index && map[currentPos[0] - level.effectiveSize[0]][currentPos[1] - level.effectiveSize[1] - 1] >= 0) {   // Above
            index = map[currentPos[0] - level.effectiveSize[0]][currentPos[1] - level.effectiveSize[1] - 1];
            var directionToAdd = 2;
        }
        if (map[currentPos[0] - level.effectiveSize[0] + 1][currentPos[1] - level.effectiveSize[1]] < index && map[currentPos[0] - level.effectiveSize[0] + 1][currentPos[1] - level.effectiveSize[1]] >= 0) {   // To the right
            index = map[currentPos[0] - level.effectiveSize[0] + 1][currentPos[1] - level.effectiveSize[1]];
            var directionToAdd = 3;
        }

        switch (directionToAdd) {   // Move the currentPos in the direction where the index value was the lowest
            case 0:
                currentPos[1] += 1;
                break;
            case 1:
                currentPos[0] -= 1;
                break;
            case 2:
                currentPos[1] -= 1;
                break;
            case 3:
                currentPos[0] += 1;
                break;
        }
        path[i] = directionToAdd;   // Add the direction to the path array
    }
    return path;
}