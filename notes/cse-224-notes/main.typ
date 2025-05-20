// https://typst.app/project/rvqCixpWd4PjBwI9zYO50e

#set heading(numbering: "1.")
#set enum(numbering: "1.a.")

= lecture 1

at a glance:

+ Tue April 1: Intro, motivation, and logistics
+ Thu April 3: Go Programming Fundamentals
  1. Introduction and Go basics
  2. Reading and Writing Files in Go (Basic I/O)
  3. Managing Structured Data with Custom Structs
  4. Moving Data Between Memory and Disk
  5. Passing Functions to Other Functions (Higher-order functions)
  6. Summary and Q&A
+ Tue April 8: Fundamentals of Networking and Go's Net package
  1. Protocols and layering
  2. Addressing
  3. Go's net Package Overview (IPs, Netmasks, and DNS)
  4. Demo: Working with IPs, Netmasks, and DNS
  5. Wrap-up/Q&A
+ Thu April 10: Establishing TCP Connections and Simple Client-Server Examples
  1. TCP basics and connection lifecycle
  2. Programming a TCP client in Go (Echo protocol)
  3. Under the hood: OS system calls
  4. Programming a TCP server in Go (Echo protocol)
  5. Wrap-up/Q&A
+ Tue April 15: Sending and Receiving Data, Error Handling, and Practical Considerations
  1. Data Transmission over TCP
  2. Framing and Parsing
  3. Advanced Concepts: Timeouts and error handling
  4. Demo: Building a "Turing Award" protocol service
  5. Wrap-up/Q&A
+ Thu April 17: Network performance metrics
  1. Introduction to Network Performance
  2. Deep Dive into Key Metrics
  3. Measuring Performance Metrics with Go
  4. Analyzing Performance Data: Statistics and Percentiles
  5. Practical Considerations & Pitfalls
  6. Wrap-up/Q&A
+ Tue April 22: Introduction to RPC and gRPC Fundamentals
  1. Introduction to RPC
  2. gRPC Introduction
  3. Working with Protocol Buffers (Protobuf)
  4. Creating a Basic gRPC Server and Client in Go
  5. Wrap-up and Q&A
+ Thu April 24: gRPC Concepts and Practical Usage in Go
  1. gRPC Advanced Features (15 mins)
  2. In-depth Streaming RPC Examples
  3. Practical gRPC Server Design and Middleware
  4. Integrating File/Data Handling with gRPC
  5. Wrap-up/Q&A
+ Tue April 29: The HTTP protocol
  1. Introduction to HTTP
  2. HTTP Requests & Responses
  3. Statelessness and Sessions
  4. HTTP Tools & Inspection (Demo)
  5. Wrap-up and Q&A
+ Thu May 6: Building Web Servers Using Go
  1. Introduction to Web Servers in Go
  2. Basic HTTP Server in Go (Demo)
  3. Basic Web Server and Request Handling
  4. Handling Requests and Responses
  5. Handling Multipart File Uploads
  6. Wrap-up and Q&A
+ Thu May 8: HTTP-Based Video Streaming with MPEG-DASH
  1. Introduction to HTTP Video Streaming
  2. Fundamentals of MPEG-DASH
  3. Understanding DASH Manifests and Segments
  4. Adaptive Bitrate (ABR) Streaming
  5. Implementing Basic HTTP-based Streaming in Go
  6. Wrap-up/Q&A
+ Tue May 13: Introduction to SQLite and Go
  1. Introduction to Databases & SQLite
  2. Basics of SQL for Beginners
  3. Using SQLite with Go
  4. Practical Tips and Patterns
  5. Wrap-up/Q&A
+ Thu May 15: Scaling Networked Services
  1. Introduction to Scaling (Horizontal vs. Vertical)
  2. Factors affecting scalability, metrics, and bottlenecks
  3. Techniques for Scaling Networked Services
  4. Practical Examples: Scaling Network Services with Go
  5. Real-world Considerations and Challenges
  6. Wrap-up/Q&A
+ Tue May 20: Locating and Scaling Data with Consistent Hashing
  1. Introduction to finding "flat names"
  2. Peer-to-peer (P2P) networks
  3. Understanding Consistent Hashing (vs static hashing)
  4. Practical Implementation: Consistent Hashing in Go (20 mins)
  5. Wrap-up/Q&A
+ Thu May 22: Content Distribution Networks (CDNs) featuring Akamai
+ Tue May 27: Fault-tolerance
+ Thu May 29: Fault-tolerance (con't)
+ Tue June 3: Guest Lecture
+ Thu June 6: Wrap-up and conclusions

= lecture 2

slides are about what go is

= lecture 3

== protocols and layering

each layer relies on services from below, exports to above

interface between layers determines interaction

/ encapsulation: hiding implementation details
/ modularity: changing layer w/o changing other layers

=== internet delivery model

packets between hosts. connectionless, e/ packet is handled separately, independently

IP packet has 20 byte (5 32-bit words) header

/ host: computers eg laptops, etc
/ packet: sent/received, up to 64KB, 1500 bytes is norm
/ "best effort" delivery: arbitrary order of delivery, can be lost, no auto retransmit, poss duplicates, corruption, arbitrary delays
/ RPC: remote procedure call, allows to "call into" code on another machine
/ TCP: stream of bytes, ensures data arrives reliably in same order
  - connection oriented, requires establishing/terminating conn
  - "infinite byte stream"
  - reliable in order delivery, retransmission, no dupes
  - high latency variance (a cost)
  - eg: http, ssh, ftp
/ UDP: packets of data sent from app to another
  - best effort, arb order, no retransmit, dupes
  - low latency variance
  - packet-like interface, requires packetizing
  - eg: dns, voip, vod

network layers: application, transport, network, link

OSI network stack: application (7), presentation, session, transport, network, data link (logical link control, media access control), physical (1)

encapsulation via headers, eg:
```
MAC(IP(TCP(H5(H6(H7(request...))))))FCS
```

== addressing

- with client app, need to comm w remote sys via IP addr
- when implementing network service on cloud, typically assigned subnet (group) of IP addr. need to use/manage appropriately

IP protocol: prepend IP header to message, set dest and source IP addr, let internet routers forward it along shortest path. then destination network forwards to intended host

/ IPv4: 32 bits, usually presented as four octets
/ IPv6: 128 bits, presented as 8 16-bit blocks in hex separated by colons

each network globally assigned 1+ groups of contiguous IP addr. hosts in network locally assigned IP addr from that range

/ route aggregation: each router keeps "next hop" on per-network (not per-host) basis, list of networks (and next hops) and their size
/ class-based addressing: (not rly used anymore) most significant bits determine "class". class A `0...` 16M hosts, class B `10...` 64K hosts, class C `110...` 254 hosts

  prefix followed by network bits then host bits

  special addrs:
  - class D `1110...` for multicast, class E `1111...` experimental
  - 127.0.0.1: localhost
  - host bits all 0: network address
  - host bits all 1: broadcast addr (sends to all hosts in local network, often disabled for large networks)

  example: 192.168.0.0/16 has IP 192.168.156.97, with network IP 192.168.0.0, host IP 0.0.156.97

  running out of classes A and B, and C too small
/ CIDR (classless inter-domain routing): 1993, networks described by variable-length prefix and length, allows arbitrary allocation between network and host address

  / prefix: network bits
  / mask: number of significant bits representing prefix

  e.g. 10.95.1.2 is in 10.0.0.0/8: 10.0.0.0 is network, remainder 95.1.2 is host

  finer grained allocation, aggregation, but more expensive lookup (longest prefix match)

let $L =$ prefix length in bits
- IP is 32 bits wide
- network is $L$ bits wide
- host is $32-L$ bits wide
- subnet mask is $L$ $1$'s, then $32-L$ $0$'s

example: 192.168.156.97/19. "/19" means first 19 bits are _network_ bits, $32-19$ define host.

example: suppose we're an internet provider. connect to internet, advertising and being assigned 212.56.132.0/22 range
- first $22$ bits are network, we control $10$ bits
- we can give four customers 256 IP addrs each: 212.56.132.0/24, 212.56.133.0/24, 212.56.134.0/24, 212.56.135.0/24
  - first 22 of their bits are all the same
  - we can use next 2 bits to forward to customer

/ port: IP addr actually identifies network interface on machine. to identify programs, use port
  - 0--1024 reserved for OS, 1024+ we can use
/ domain name system (DNS): convert name to addr
  ```go
  ips, err := net.LookupIP("www.google.com") // names can map to > 1 IP addr
  ```

= lecture 4

== time

unix "time" protocol

- TCP port 13
- app initiating connection called "client," receiving end is "server"
- TCP bidirectional protocol, can send bytes either way
- format: ASCII date string #emoji.skull

layers for querying time:

- L7: timequery.go
- L4: TCP (source: autoassign port, dest: 13)
- L3: IP (source: autoassigned, dest: time.nist.gov)
- L2: link layer (e.g. wifi, ethernet), beyond us
- L1: physical layer (e.g. modulation on radio), way beyond us

== syscalls

client (like caller in phone call):

- `open_clientfd`
  - creates socket, gets socket descriptor (on unix, sockets are basically files). no network activity yet
    ```c
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    ```
    - `socket()` returns file descriptor
    - `AF_INET` (or `PK_INET`): IPv4 addr family, want internet protocol. `AF_INET6` for IPv6
    - `SOCK_STREAM` for streaming socket type, means TCP (as opposed to `SOCK_DGRAM`)
    - `sock < 0` means fail
    - allocates resources in OS, including send and receive queue. size configurable at OS level, 4--8 MB for linux
  - call `connect`, initiate connection request to server given IP addr, port number
    - client does 3-way handshake: client sends SYN packet, server replies with SYN ACK packet, then client responds with its own ACK packet, and the connection is established
    - high overhead especially from transmission, so usually when connection open, try to keep it open and do many operations through it, not a connection for every little op
    - ```c
      struct sockaddr_in sin;
      memset(&sin, 0, sizeof(sin));
      sin.sin_family = AF_INET;
      sin.sin_addr.s_addr = inet_addr("128.32.132.214");
      sin.sin_port = htons(80);
      if (connect(sock, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        // fail
      }
      ```
      - `connect()` waits until connection establishes/fails
      - `inet_addr()` converts IP addr str to 32-bit addr number (in network byte order)
- once TCP connection established, enter point where both endpoints can `read`/`write` data to e/o.
  ```c
  int read_bytes = recv(sock, buffer, expected_data_len, 0);
  ```
  - `recv()` (or `read()`, `readv()`) reads bytes from socket, returns number of bytes read
  - `read_bytes` may not equal `expected_data_len`
    - if no data available, it blocks
    - if only partial data available, `read_bytes < expected_data_len`. should retry for remaining portion
    - on socket close, `read_bytes == 0` (not error)
    - `read_bytes < 0` means fail
  - usually want to call in a loop
  ```c
  int sent_bytes = send(sock, data_addr, data_len, 0);
  ```
  - `send()` (or `write()`, `writev()`) sends bytes, returns number of bytes sent
  - sockets blocking by default, will block until all data sent
    - this course will only worry about blocking
  - for non-blocking sockets, `sent_bytes` may not equal `data_len`, if kernel doesn't have enough space and accepts partial data, so must retry for unsent data
  - `sent_bytes < 0` means fail
  - last `0` is a flag we dont care about
- client eventually calls `close`, initiating teardown process, making server also close connection
  - graceful close has its own packets involved

server (like person answering in phone call)

- `open_listenfd`
  - create socket data structure (determines if TCP/UDP). OS doesnt know if we're server or client yet
  - `bind` takes socket, associates with address (network interface, e.g. "i don't care") and port number. no network activity yet
    ```c
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;
    sin.sin_port = htons(server_port);
    if (bind(sock, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
      // fail
    }
    ```
    - `bind()` binds socket with port number. kernel remembers which process has which port, only one process can bind a port at a time
      - can call on client if you care what TCP port the client socket is assoc with
    - `struct sockaddr_in`: IPv4 socket addr struct (`struct sockaddr_in6` for IPv6)
    - `INADDR_ANY`: if server has multiple IP addresses, bind any
      - allows for binding to just wifi or just ethernet
    - `htons()` converts host to network byte order
      - most machines (not all) are little-endian
      - internet standardized on big-endian, including ports (2 byte number)
      - utility functions: `htons(uint16_t hostval)`, `htonl(uint32_t hostval)`, `ntohs(uint16_t netval)`, `ntohl(uint32_t netval)`. `h` host, `n` network byte order; `s` short (16-bit), `l` long (32-bit)
  - `listen` tells OS this is a server socket, will accept connections from network
    ```c
    if (listen(sock, back_log) < 0) {
      // fail
    }
    ```
    - sockets default to active. must be passive to get connections
    - `listen()` converts socket to passive
    - `back_log`: connection-waiting queue size (e.g. 32)
      - busy server may need large value, e.g. 1024
      - parks incoming connections in a queue while handling one connection
      - configurable in Go. to decouple accepting and handling connections, we use concurrency
- `accept` blocks program thread, wait for incoming connection requests.
  ```c
  struct sockaddr_in client_sin;
  int addr_len = sizeof(client_sin);
  int client_sock = accept(listening_sock,
                          (struct sockaddr *) &client_sin,
                          &addr_len);
  ```
  - if `client_sock < 0`, fail
  - `accept()` returns new *client socket descriptor* for client connection in connection-waiting queue, to communicate with client. passive socket (`listening_sock`) not for client comms
- once connection established, `accept` unblocks, now can `read`/`write` with client
- at some point, either:
  - call `close` on server side, which'll tell client connection is closed, return to loop and `accept` next connection
  - client closes connection suddenly. if `write`ing to client, will get error message. if `read`ing, will get error that indicates that they've closed connection, so can close server side of things

continues in lecture 5...

=== socket queues

`send()` -> send queue -> receive queue -> `recv()`

- `send` copies data into send queue, then `send` returns. up to TCP protocol to convey data from send queue to receive queue on other end
  - how TCP? CSE 123
  - on return, data may not have left machine yet
  - TCP will not guarantee that the data is sent to the server app, just its host
- in server, `recv` copies data out of receive queue
- data sent in packets of like 1.5 kB, so send call data might be sent in multiple packets
  - in past, every time you call `send` it'll send at least one packet
  - now a heuristic nagle's algorithm will hold onto packets for brief moment to see if more data coming, then sends it
  - same packet may have data from multiple send calls. but we dont have control over that assignment
- no correspondence between size/number of send and receive calls. like writing chunks to file then reading from it

when does blocking occur?

- if `data_len >` send queue size, `send()` blocks until `data_len -` send queue size transferred to receive queue
- if `data_len >` send queue + receive queue sizes, `send()` blocks until receiver calls `recv()` enough to read in `data_len -` (send queue + receive queue sizes)

deadlock cases:

- both sides call `recv()` w/o sending data
- both sides send each other enough data to fill up each other's send and receive queues
  - to avoid, usually roles established depending on protocol

= lecture 5: protocols

/ protocol: explicit, implicit conventions for how to communicate (but not what communicated). allows for different architectures/OSes/byte ordering to communicate
/ service interface: one layer of a protocol, how one layer communicates with other at same layer
/ interface: between layers. eg HTTP talks to TCP at layer below it

protocols come from standards bodies (eg ISO), community efforts (eg bitcoin), corporations/industry (zoom, games)

can be specified with english prose, BNF, state transition diagram, message sequence diagram, packet format (bits in table)

/ operation: action can perform in protocol's service interface, e.g. "submit vote"
/ message: encoding of op or data according to protocol's wire format, e.g. xml, json, binary
/ framing: writing/reading msgs from stream so messages can be separated. find bytes corresponding to single message, add context to msg so other side can determine msg boundaries
/ parsing/encoding/decoding: converting between msg and app-level data structure

options for framing:

/ explicit length: length first. but how big should length be?
  - keep reading until have $n$ bytes of request data
  - write length of message, then message
  - read length, then read that many bytes (security?)
/ delimiter: delimiter at end. but if delimiter in msg?
  - scan for delimiters in a loop
  - write message, then delimiter
  - read into buffer until delimiter found. return message to higher layer

main loop of server:

```go
remaining := ""
buf := make([]byte, 1024)
for {
  if hasFullRequest(remaining) {
    parse(remaining)
    remaining = removeRequest(remaining)
  }
  size, err := c.Read(buf)
  data := buf[:size]
  remaining = remaining + string(data)
}
```

= lecture 6

== performance metrics

/ bandwidth: number of bits per unit of time in channel, available over link
/ throughput: bandwidth available to application, i.e. subtract protocol headers
/ latency: propagation + transmit + queue
  / propagation: distance #math.div speed of light in medium. can't control
  / transmit: 1 bit #math.div bandwidth. how long to modulate bit onto channel. minor impact
  / queue: (queuing delay/time) time waiting in switches or routers behind other traffic (traffic jam). lots of people using internet, gotta wait your turn. network hierarchy of access points/routers to egress point. if two packets arrive at same time, one must wait. can minimize if smart
/ overhead: seconds for CPU to put message on wire
/ error rate: probability that msg won't arrive intact

- computer architecture: base $2$ (mega $2^20$, kilo $2^10$). Mbps = megabytes per second
- computer networks: base $10$ (mega $10^6$, kilo $10^3$). Mbps = megabits per second

=== tools

`ping` tests if other side alive and gets round trip latency (RTT)

`iperf3` times how long to send $n$ bytes to other side, calculates throughput

== tail latency problem (paper we were supposed to read)

for web search indexing, dataset sharded across nodes

- want to look for a term. could have client query all servers, which sucks, and also need to know about all servers. lots of work. and exposes internal org stuff to client
- real life: aggregation/front end server interacting with clients, handles internal connection management on their behalf. can forward query in parallel to all servers it knows about. then maybe present info to user

paper authors found that the more servers they added, not much performance gain

avg time 10 ms, but 99th percentile latency was one second. big problem apparently. because when aggregator does parallel requests, when one of the servers has latency of one second, then the user-facing latency is one second. more servers they add, more likely to encounter bad performance: latency variability is magnified at service level

could take out consistently slow servers, but slowness could vary from request to request

factors for variable response time: CPU cores, processor caches, memory bandwidth, network switches, shared file systems, scheduled daemons, data reconstruction in FS, periodic log compactions, periodic garbage collection, queuing in servers and network switches, throttling due to thermal CPU effects, random access in SSD, power saving modes, switching to active mode, etc.

solution: wait until 95% of "leaf" requests return then call it done, skip the rest. because 5% of servers contribute 50% of latency. good for when answer is not exact (e.g. search queries, social media)

other optimizations:

- tied\/*hedged requests* (like betting): for the 5% slow machines, send another request and hope it comes back faster. problem: may induce more load. then allow a cancellation mechanism to the slower node to delete request

=== reducing component variability

/ differentiate service classes: have two queues, one for more important requests (e.g. premium users, non-interactive requests)
/ high level queuing: aggregator avoids sending requests to node if it's taking a while to respond to requests
/ reduce head-of-line blocking: break complicated requests into smaller pieces
/ synchronize disruption: do background activities (e.g. GC) at same time so everyone experiences disruption at once, not spread across node

hardware only gets more diverse, so need to tolerate variability

higher bandwidth reduces per-msg overhead, makes it more likely cancellation msgs received in time

=== canary requests

when updating code, roll it out to only a few servers, then see if requests fail. if not, continue

== memcached (lecture 7)

"mem cache D"

/ memcached: open source software running on node, accepts network connections, simple cache. like lossy hashmap, can store most commonly accessed key value pairs. on access they're pulled right from RAM. when RAM fills up, eviction policy evicts older least recently used items. used to accelerate apps
  - simple `get()`, `put()` interface
  - caches popular/expensive requests
  - LRU replacement policy
  - data stored in RAM, so access is fast
  - may be running on same host, diff port, or separate phys machine, or several machines

queries go to memcached first. on hit, result returned very quickly

```py
def get_thing(id):
    thing = memcached_get(f"thing: {id}")
    if thing: return thing

    thing = fetch_thing_from_database(id)
    memcached_set(f"thing: {id}", thing)
    return thing
```

same tail tolerance issue happens if you have $S$ memcached servers and wait until all servers return. if service time $~ N(mu, sigma)$

lesson: everything will have variance within and outside our control. how you want to handle it will determine how you build your application

and memcached is useful to be aware of

= lecture 7: RPC
