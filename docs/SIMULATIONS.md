# Simulation map

| Player situation | Runtime behavior | Where to edit |
| --- | --- | --- |
| A last-minute venue change | Guests learn the address through actual encounters. Each guest retains the source and history of what they heard. | [Crowd simulation](../comparison/simulation.js) and [checkpoint branches](../comparison/worker.js) |
| A guest gives someone an invitation | The listening room can replay the conversation and a guest can explain who told them. | [Listening room](../play.js) |
| A stagehand is called away | The crew plans work under skill, travel and dependency constraints. It resumes from the physical state of the unfinished task. | [Planner](../crew/planner.js) and [execution](../crew/execution.js) |
| A record is filed out of sight | The archivist chooses a search order using available observations, the geometry and earlier bin visits. | [Search](../perception/search.js) |
| Opening night depends on all of them | Attendance sets the speaker layout. Finding the reference record releases the audio task. | [Game-brief scenario](../pipeline/scenario.js) and [stage work orders](../crew/scenario.js) |
| One night with all of them | Beliefs from the foyer decide which staff arrive late. The planner works around late arrivals, a game master searches for fixable trouble and anyone can be questioned. | [The night](../night/world.js), [knowledge and answers](../night/mind.js) and [the game master](../night/director.js) |

## What the model does

The local model maps the player’s premise to a supported venue situation, such as a relocated concert or a missing pressing. The venue already has its guests, their capabilities, its stage equipment and its archive. The scenario selects and runs those systems. The model never writes the attendance, the number of bins visited or the outcome of a job. The static examples store the model interpretation and rerun the same deterministic simulation.

The recorded model was Qwen2.5-1.5B-Instruct Q4_K_M behind a local llama.cpp-compatible endpoint. The live check verified the three saved briefs, a paraphrase of the relocation premise and rejection of an unrelated game.

## Reproduce the featured case

On the game-brief route, run Opening night with the venue’s default seed. The original crowd sends 37 guests to East Hall and the stage needs two speaker zones. Delaying Ada sends 10 guests there and the stage needs one zone. With the archive view open, Ida checks one bin. Blocking her view makes her check two. The audio task’s earliest start is Ida’s actual discovery tick. These values are fixtures for this crowd, room and work order. [Scenario regression](../pipeline/scenario.test.js)

## Earlier schedule experiment

A separate local integration check used Arcade’s existing NPC recipe compiler and game clock. A schedule edit moved Ida’s Dispatch shift from 6 pm to 8 pm. At 7 pm the original worker was at Dispatch and the edited worker was at Intake. The edited worker then walked to Dispatch as the clock advanced. That experiment used an external Arcade checkout. The standalone game-brief demo uses the public Side B scenario code linked above.
