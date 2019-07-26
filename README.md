<p align="center">
  <img src="/public/assets/images/sysdig-inspect-logo-color-620x96.png" alt="Sysdig Inspect" />
</p>

---

[Sysdig Inspect](https://sysdig.com/blog/sysdig-inspect) is a powerful opensource interface for container troubleshooting and security investigation

Inspect's user interface is designed to intuitively navigate the data-dense sysdig captures that contain granular system, network, and application activity of a Linux system. Sysdig Inspect helps you understand trends, correlate metrics and find the needle in the haystack. It comes packed with features designed to support both performance and security investigations, with deep container introspection.

To use Sysdig Inspect, you need capture files collected on Linux with [sysdig](https://github.com/draios/sysdig).

Where to start?
---
**Sysdig Inspect container**

Sysdig Inspect is available as Docker container image.

```
docker run -d -v /local/path/to/captures:/captures -p8080:3000 sysdig/sysdig-inspect:latest
```

Sysdig Inspect will be available in your browser at http://localhost:8080!

For more information, check out the [Sysdig Inspect repository on Docker Hub](https://hub.docker.com/r/sysdig/sysdig-inspect).


**Sysdig Inspect desktop**

Here are the installers available for the latest version:

* MacOS installer: https://setns.run/install-inspect
* Windows installer: https://setns.run/install-inspect-windows
* Linux installer (RPM version): https://setns.run/install-inspect-rpm
* Linux installer (DEB version): https://setns.run/install-inspect-deb

You can check the changelog at https://github.com/draios/sysdig-inspect/releases.


Main Features
---
**Instant highlights**

![Instant Highlights](/assets/screenshots/Sysdig-Inspect-1.png)

The overview page offers an out of the box, at a glance summary of the content of the capture file. Content is organized in tiles, each of which shows the value of a relevant metric and its trend. Tiles are organized in categories to surface useful information more clearly and are starting point for investigation and drill down.

**Sub-second microtrends and metric correlation**

![Sub-second microtrends and metric correlation](/assets/screenshots/Sysdig-Inspect-2.png)

Once you click on a tile, you will see the sub-second trend of the metric shown by the tile. Yes, sub-second. You will be amazed at how different your system, containers and applications look at this level of granularity.  Multiple tiles can be selected to see how metrics correlate to each other and identify hot spots.

**Intuitive drill-down-oriented workflow**

![Intuitive drill-down-oriented workflow](/assets/screenshots/Sysdig-Inspect-3.png)

You can drill down into any tile to see the data behind it and start investigating. At this point you can either use the timeline to restrict what data you are seeing, or further drill down by double clicking on any line of data. You will be able to see processes, files, network connections and much more.

**Payloads and system calls visualization**

![Payloads and system calls visualization](/assets/screenshots/Sysdig-Inspect-4.png)

Every single byte of data that is read or written to a file (provided the appropriate `--snaplen` parameter is used while creating the capture), to a network connection to a pipe is recorded in the trace file and Sysdig Inspect makes it easy to observe it. Do you need to troubleshoot an intermittent network issue or determine what a malware wrote to the file system? All the data you need is there. And, of course, you can switch at any time into sysdig mode and look at every single system call.

Collecting & Loading Captures
---
**Creating a capture file**
Sysdig Inspect works with capture files that have been collected by [sysdig](https://github.com/draios/sysdig) on a Linux system. The [sysdig user guide](https://github.com/draios/sysdig/wiki/Sysdig-User-Guide) contains a nice introduction to the tool and includes many examples that can guide you through the command line and filtering syntax.

As a very easy quick start, here's how to capture all of the system events on a Linux box with sysdig:

`sudo sysdig -w filename.scap`

**Example Trace files**
[502 Error](https://github.com/draios/sysdig-inspect/blob/master/capture-samples/502Error.scap) Troubleshooting an HAProxy 502
[404 Error](https://github.com/draios/sysdig-inspect/blob/master/capture-samples/404Error.scap) Troubleshooting a 404 error from a leaky file

Join the Community
---

* Join our [Public Slack](https://slack.sysdig.com) channel for announcements discussions, and help
* Follow us on [Twitter](https://twitter.com/sysdig)
* This is our [blog](https://sysdig.com/blog/sysdig-inspect). There are many like it, but this one is ours.

License Terms
---
Sysdig is licensed to you under the [GPL 2.0](https://github.com/draios/sysdig/blob/dev/COPYING) open source license.
