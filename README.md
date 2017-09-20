Sysdig Inspect
================

Sysdig Inspect is an interactive sysdig trace file analyzer that runs on your Mac or your PC.

The Inspector's user interface is designed to intuitively navigate the data-dense sysdig captures that contain granular system, network and application activity of a Linux system. Sysdig Inspector helps you understand trends, correlate metrics and find the needle in the haystack. It comes packed with features designed to support both performance and security investigations, and fully supports comtainers introspection.

To use Sysdig Inspect, you need trace files collected on Linux with [sysdig](https://github.com/draios/sysdig).

Main Features
---
**Instant highlights**  

(screenshot)  

The overview page offers an out of the box, at a glance summary of the content of the trace file. Content is organized in tiles, each of which shows the value of a relevant metric and its trend. Tiles are organized in categories to surface useful information more clearly. Tiles are also the starting point for investigation and drill down.

**Sub-second microtrends and metric correlation**  

(screenshot)  
 
Once you click on a tile, you will see the sub-second trend of the metric shown by the tile. Yes, sub-second. You will be amazed at how different your system, containers and applications look at this level of granularity.  Multiple tiles can be selected to see how metrics correlate to each other and identify hot spots.

**Intuitive drill-down-oriented workflow**  

(screenshot)  

You can double-click on a tile to see the data behind it and start a drill down session. At this point you can either use the timeline to restrict what data you are seeing, or further drill down by double clicking on any line of data. You will be able to see processes, files, network connections and much more.

**Payloads and system calls visualization**

(screenshot)

Every single byte of data that is read or written to a file, to a network connection o to a pipe is recorded in the trace file and Sysdig Inspect makes it easy to observe it. Do you need to troubleshoot an intermittent network issues or determine what a malware wrote to the file system? All the data you need is there. And, of course, you can switch at any time into sysdig mode and look at every single system calls.

Where to start?
---

**Installing Sysdig Inspector**  
(download and install instructions)  

**Creating a trace file**  
Sysdig Inspect works with trace files that have been collcted by [sysdig](https://github.com/draios/sysdig) on a Linux system. The [sysdig user guide](https://github.com/draios/sysdig/wiki/Sysdig-User-Guide) contains a nice introduction to the tool and includes many examples that can guide you through the command line and filtering syntax. 

As a very easy quick start, here's how to capture all of the system events on a Linux box with sysdig:

`sudo sysdig -w filename.scap`

**Example Trace files**  
(link to a couple of trace files that can be used out of the box)

Support
---

For support using sysdig, please contact the [the official mailing list](https://groups.google.com/forum/#!forum/sysdig).

Join the Community
---
* Contact the [official mailing list](https://groups.google.com/forum/#!forum/sysdig) for support and to talk with other users
* Follow us on [Twitter](https://twitter.com/sysdig)
* This is our [blog](https://sysdig.com/blog/). There are many like it, but this one is ours.
* Join our [Public Slack](https://slack.sysdig.com) channel for announcements and discussions.

License Terms
---
Sysdig is licensed to you under the [GPL 2.0](https://github.com/draios/sysdig/blob/dev/COPYING) open source license.
