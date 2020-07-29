/* a POC of coroutine based concurrency instead of process based

Benefits:
1. Easy to share global states between all cases (for example, a webdriver pool with 10 browsers)
2. More efficient when cases number in files are different

For cpu intensive tests process based one is still a good option.
But for io intensive test (like webdriver based), coroutine based concurrency will be more feasible
*/


// import all scripts into a single file (can use dynamic import in real battlefield)
// and execute this file, that's all!
// for throttle control, we implement a simple semaphore and put it in beforeEach & afterEach hooks

import './02-01.test.ts';
import './02-02.test.ts';


// current issue: see ./03-hooks.test.ts
