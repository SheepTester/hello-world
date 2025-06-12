// https://typst.app/project/rvqCixpWd4PjBwI9zYO50e

#set heading(numbering: "1.")
#set enum(numbering: "1.a.")

lectures and slides are CC BY-NC-SA 3.0 so this document is too:

- my professor porter, ucsd
- Kyle Jamieson, Princeton University (also under a CC BY-NC-SA 3.0
Creative Commons license)
- David Choffnes, Northeastern University

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

/ remote procedure call: goal: to make client-server comm transparent, so dont need to think about network. retain "feel" of writing centralized code. make it look like a local proc call

issues:

- heterogeneity: client needs to rendezvous with server, server must dispatch required function
- message might get dropped, or client/server/network fails
  - so every call may have error
- can be $10^3$--$10^6 times$ slower

remote machine might represent data types with diff sizes, use diff endianness, represent floats differently, diff data alignment requirements

many languages have no built-in concept of RPC (e.g. C, C++, old Java), some languages support RPC (e.g. Python, Haskell, Go)

/ interface description language: machine-, language- indep way to pass proc params and return value
  - write interface description in IDL. define API for proc calls, names, return/param types
  - run IDL compiler, generating code to
    - *marshal* (convert) native data types to machine-indep data stream, and vice versa (*unmarshal*)
    - client code for forwarding local proc call as request to server
    - server code to dispatch RPC to implementation

RPC steps:
+ client calls stub, pushes params onto stack
+ stub marshals params to network msg
+ OS sends network msg to server
+ server OS receives message, sends it to stub
+ server stub unmarshals params, call server func
+ server function runs, returns value
+ server stub marshals return value, sends msg
+ server OS sends reply back over network
+ client OS receives reply, passes to stub
+ client stub unmarshals return value, returns to client

server stub has two parts:
/ dispatcher: receives a client's RPC request, identifies which server-side method to invoke
/ skeleton: unmarshalls params, calls server proc, marshals response, send
hidden from programmer, may be integrated depending on impl

/ protobuf: an IDL. language neutral way of specifying data structures (*messages*), *services* (procedures/methods: gPRC). has stub compiler `protoc`

```proto
syntax = "proto3";

message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
}

service Search {
  rpc searchWeb(SearchRequest) returns (SearchResult) {}
}

```
- number labels so new fields compatible with legacy code
- every function has one input output, but can just create message containing multiple values
- map type: `map<string, Project> projects = 3;`

= lecture 8: protobuf

??

= lecture 9: HTTP

/ HyperText Transfer Protocol (HTTP): used for web browsing, but also video streaming (DASH), REST (representational state transfer), chat apps, etc.
  - text-oriented protocol
  - request/response protocol:
    ```
    START_LINE<CRLF>
    MESSAGE_HEADER<CRLF>
    <CRLF>
    MESSAGE_BODY<CRLF>
    ```
    - first line determines whether it's req or res msg

- docs link to other docs in HTML files
- HTTP is protocol for retrieving HTML files (and images, sounds, video, etc) from servers
- implemented in servers (apache, nginx, etc) and clients (chrome, edge, safari, etc)

when you click a link:
+ browser determines URL
+ browser asks DNS for IP of server
+ DNS replies
+ browser opens TCP conn
+ send HTTP req for page
+ server sends page as HTTP response
+ browser fetches other URLs as needed
+ browser displays page
+ TCP conns released

request messages have:
- operation (*method*) to be performed
- web page operation should be performed on (*request URI*)
- version of HTTP (was 0.9, 1.0, 1.1 for a while, then 2, 3)
```http
GET /index.html HTTP/1.1
```

methods:
/ GET: read web page
/ HEAD: read web page's header
/ POST: append to web page
/ PUT: store a web page
/ DELETE: remove web page
/ TRACE: echo incoming request
/ CONNECT: connect thru proxy
/ OPTIONS: query options for page
(last 3 are advanced)

/ request headers: text-based, key value sep by colon. after start line
  ```http
  GET /images/cat2.jpg HTTP/1.1
  Host: www.cs.ucsd.edu
  User-Agent: Chrome 12.1
  ```
  - `Host` header for virtual hosting

http responses have:
- start line: HTTP version, 3-digit status code, text description of code
  ```http
  HTTP/1.1 200 OK
  Content-Type: text/html
  Content-Length: 291
  ```

status codes:
/ 1xx: info, e.g. 100 = server agrees to handle client req
/ 2xx: success, e.g. 200 = succeeded, 204 = no content present
/ 3xx: redirect, e.g. 301 = page moved, 304 = cached page still valid
/ 4xx: client error, e.g. 403 = forbidden, 404 = not found
/ 5xx: server error, e.g. 500 = internal server error, 503 = try again later

how to make server:
+ accept TCP conn from client (browser)
+ get path to page
+ get file from disk
  - may be replaced with execution of program that generates contents for dynamic content
+ send HTTP headers then file contents to client
+ release TCP conn
modern web servers have more features

/ HTTP 1.1 persistent connections: creating new conn for each request has overhead. now can reuse conn over many reqs/responses, but more complex framing/parsing. 1.1 spec specifies separating requests
  - uses `Content-Length`
  - server will leave conn alive for configurable timeout, e.g. 30s

= lecture 10: DNS

/ DNS host name: mnemonic name for humans, variable length, uses full alphabet, little info about location
/ IP address: numerical addr for routers, fixed length, decimal numbers, hierarchical addr space related to host location

DNS used for hostname #sym.arrow.r IP addr translation
/ reverse lookup: IP addr to hostname translation
/ aliasing: other DNS names for host: *alias* host name points to *canonical* host name
/ email: lookup domain's mail server by domain name

1982, per-host file called `/etc/hosts`
- flat namespace. each line has IP addr and DNS name
- SRI (in menlo park, CA) has master copy
- everyone else downloads regularly
but single server doesn't scale. traffic implosion (lookups and updates), single point of failure

DNS goals:
- wide-area distributed database
- scalable, decentralized maintenance
- robust
- global scope: names mean same thing everywhere
- distributed updates, queries
- good performance

/ zones: hierarchical name space divided into these contiguous sections. distributed over collection of DNS servers

hierarchy of DNS namespace matches hierarchy of servers. nameserver answers queries for names within zone, stores names and links to other servers in tree (not binary)
/ root servers: identity hardcoded into other servers
  - 13 root servers in the world (in palo alto, mountain view, LA, etc): https://www.internic.net/domain/named.root
    - for geographic redundancy
/ top-level domain (TLD) servers: responsible for `com`, `org`, `net`, `edu`, `uk`, `fr`, `ca`, `jp`, `xxx`, etc
  - Network Solutions handles `com`
  - Educause non-profit handles `edu`
/ authoritative DNS servers: behalf of org, e.g. company, university, nonprofit, govt, UCSD (CSE used to have its own within UCSD's)
  - maintained by org itself or ISP (for smaller orgs)
/ local DNS servers: located near clients and resolver software on client perform translations. not strictly part of hierarchy
  - each ISP, company, university has one
  - aka *default/caching* name server

DNS is distributed database of *resource records*: name, type, value, time to live (how long to cache, e.g. 1 hour. min 1 min)
/ A: IPv4 addr
/ AAAA: IPv6 addr
/ NS: name server
/ CNAME: alias to another domain name
/ MX: email (SPF, SRV relate to email fighting spam or smth, prevent people from spoofing DNS info)

most queries, responses are UDP datagrams

types of queries:
/ iterative: nameserver may respond with referral
  + client connects to local resolver with DNS name
    - local resolver could be run by university, or by wifi access point
  + resolver picks root server, send full DNS name to it
    - root servers not cached, but can periodically download
    - very infrequently. sometimes software update will update file
  + root server returns NS record pointing to TLD. cache for time to live in resolver
    - servers chosen by lowest ping time
    - TLDs have very long TTL fields, so choosing root server not important (very rare to access it, like once a day)
  + send full DNS name to TLD server
  + TLD returns NS record pointing to authoritative server
  + send whole name to auth server.
  + it might yet again send NS record to another auth server.
  + or it finally gives A record with IP addr
/ recursive: nameserver responds with answer or error
  - ask name server to do all that on our behalf

all DNS servers cache responses to queries

- command line tools: `nslookup` (classic), `dig` (more configurable)
- you can configure DNS server to use for lookup
  - provided by internet provider
  - when assigned IP, DHCP (dynamic host configuration protocol) also tells you 1+ DNS servers by internet provider that you can use
  - also third party DNS infra, like 8.8.8.8 by google, 1.1.1.1 by cloudflare
  - some ISPs will sell DNS lookup to marketing people
  - some countries will use DNS for censorship/control, block or send fake addr to page that says forbidden
  - can bypass by specifying entry point

DNS security infrastructure exists to sign DNS entries to prevent DNS hijacking, but not perfect

```go
ips, err := net.LookupIP(hostname)
```

== virtual hosting

to figure out if two hostnames are virtually hosted

- use `dig` to get IP of both. should be same
- use `printf "GET / HTTP/1.1\r\nHost: <hostname1>\r\n\r\n" | nc <hostname2> 80`

= lecture 11: concurrency

given set of tasks,
/ parallelism: the progress of elems of set occur _at the same time_
/ concurrency: the progress of mult elems of set _overlap in time_
  - may or may not be parallel
  - single thread can time slice set of tasks to make partial progress over time
  - multiple processors allow time slices to progress simultaneously
  - an abstraction
both deal w doing a lot at once

concurrency
- e/ process on server/machine has virtual memory addr space (heap, code, global vars), 1+ "threads of control" e/ consisting of local pc, local stack
- threads run on CPU core
- OS schedules threads, putting them on CPU, then deschedules them:
  - put time limit (linux has 10 ms limit for a while)
  - thread has nothing to do (because waiting on I/O)

/ goroutines: go support for concurrency
  - put `go` in front of func call
  - runtime will run it in own goroutine, concurrently w `main` and other goroutines
  - caller throws away return value
  - need other ways to retrieve results
  - no direct correl between \# goroutines supported by runtime and hardware parallelism capability

thread/goroutine per client:
- e/ per-client `net.Conn` passed to goroutine that handles conn
- simple for small, low scale projects
- but if e/ goroutine runs for long time? or many clients arrive in close time?

"hockey stick" performance graph:
- $x$-axis: system load, $y$-axis: response time
- first flat part: hardware parallelism can support all goroutines
- knee
- second rising part: e/ HW thread/core supports many goroutines $->$ queuing, delays
- want to keep system load left of knee
  - for loop accepting all connections does not do this

/ thread pool: when threads hit limit, cut off remaining requests (e.g. HTTP 503, too busy, try again)
  - too much parallelism causes thrashing, excessive switching, lower performance
  - comparison: without thread pooling, performance increases, hits peak, then decreases. with thread pooling, performance increases, hits peak, then stays at peak
  - can just add more servers to handle extra load

*TODO*: include on cheatsheet: Go channel examples

= lecture 12: streaming video

(he explains the lab)

more compression $->$ lower quality

remove redundant info

spatial locality, and temporal compression by sending diffs (codecs = compression algorithms)

to compress video, store diffs, have chunks with one full frame and a bunch of diffs. multiple full frames allow for scrubbing

(not tested:)
/ i-frame: keyframe
/ p-frame: diff to earlier frame
/ b-frame: diff to earlier or future frame
/ group of pictures (GOP): group of frames with full image and series of diffs
  - can't start video until you have full GOP

degrees of freedom:
- bit rate (quality)
- delay before displaying frame to user
  - can just download entire video before playing it
  - but we want to stream

takeaways:
- imgs over network typically compressed. affects image quality and bytes sent over network
- video compression codec takes advantage of temporal, spatial commonalities in frames for more compression
- larger file size $->$ more bandwidth $->$ higher quality video
  - when bandwidth limited, can reduce quality or give up real-time streaming, making video buffer
- *adaptive bitrate video streaming* maxxes quality, minimizes buffering
  - when downloading chunks, if it's faster than expected, increase quality. etc

== MPEG-DASH

/ MPEG-DASH: open source video streaming protocol based on HTTP
  - supports diff video encodings, bitrates, quality levels
  - designed for web servers, content distrib networks, with scale in mind
  - easy to replicate, distribute so content closer to end users
  - algorithm "smarts" in client not server, so server is passive
  - many open source players for phones, apps, browsers, TVs, etc
  overview:
  - video assets $->$ transcoder $->$ bitrate variants $->$ MPEG-DASH package and encrypt $->$ DASH MPD and chunks stored in origin server $->$ CDN
  - MPEG-DASH compliant video player $->$ req/serve video segments and MPD $->$ CDN
/ MPD (media description file): XML file defining hierarchy:
  / period: with start time
    - breaks stream into like "chapters"
    - allows client to jump thru stream w next chapter button on remote
    - can splice commercials between periods
  / adaption set: with diff encodings for different clients or languages, containing 1+ representations
  / representation: a particular resolution, bitrate, stereo/multichannel sound, language for CC
    - client chooses best for user demands, but can change between segments as network bandwidth changes
    - expression of content at particular bitrate assoc w particular avg bandwidth
  / segment: contains video/audio chunks with start time and URL
  client downloads relevant chunks to play video

+ download MPD file
+ parsed, processed by client
+ download appropriate chunks by URLs
+ display to user

= lecture 13: sqlite and scaling

locating items at scale is hard

focusing on immutable data (e.g. video content)

say we want to keep metadata and video content in memory to reduce latency

/ vertical scaling: bigger machines. get more RAM, storage, CPUs, faster CPU
  - simple: stays single machine, only one IP addr to consult
  - machines can only get so big, and single machine could fail
/ horizontal scaling: more machines. form *cluster* of 10, 1000, etc servers that work together
  - each machine can be cheap, one failing machine might not kill everything
  - but how to find data? and performance hard to reason about

probability of any failure in given period:
$ 1 - (1 - p)^n $
$p =$ prob machine fails in period, $n =$ \# machines
- for 50k machines, 99.99966% availability, then 16% of time, data center experiences a failure

/ location problem (peer-to-peer networking problem): given cluster $C$ with $N$ servers, how to find server $C_i$ with data item?
/ "flat" naming: name doesnt give indication of where data is located, like MAC addr but not IP addr or DNS name (which is hierarchical)
/ centralized lookup: has database of locations (e.g. napster), key is file name, value is list of IPs and ports
  - simple, but $O(n)$ state, single point of failure
  - single point of failure, though in napster's case it was due to court order
/ peer-to-peer (P2P) networks: distributed system architecture, no centralized control, roughly symmetric nodes. large number of maybe unreliable nodes
/ flooded queries: each node sends copies of query to as many nodes as they can (e.g. gnutella)
  - robust, but huge comm overhead. $O(n)$ messages per lookup, where $n =$ \# of peers
  - in practice, no bandwidth for all this back then
/ routed DHT queries: figure out route to get closer to publisher w/o flooding everyone (e.g. dynamodb)
  - adapted for data center, cloud computing
/ distributed hash table (DHT): local hash table. lookup hashed key to get IP addr, then use RPC to put/get by key
  - constant-time insertion and lookup in local setting
  - partitioning data in truly large scale distributed systems, e.g. tuples in global database, tritontube, p2p file share
  - rely on hashing to map keys $->$ servers. just hash filename, consult server

could mod hash by number of servers, but if server fails/joins or diff servers have diff count/estimate of servers, this is catastrophic

/ consistent hashing: same hash func maps two types of data to same ID space. then assign *tokens* (servers) to random points on circle based on hash. put object in closest clockwise bucket (`successor(key)` $->$ bucket), i.e. key stored in its successor: node with next higher ID
  / key identifier: `hash(key)`
  / node identifier: `hash(`server IP or hostname or identity`)`
  / bucket: keyspace between two tokens
  desired features:
  - balance: no bucket has "too many" objects
  - smoothness: addition/removal of token minimizes object movements of other buckets
    - only need to move $1/n$ of the data when add/remove bucket

= lecture 14: CDNs

CDN is physically distributed cache that absorbs reqs for images, requests image from web server once, then distributes it in cache so later users get absorbed in cache
- like L1, L2 cache or web cache or memcached
- used for videos images on social media

components:
- proxies: how to get web content from server other than original web server. (will involve DNS)
- caching: how can original server update content (will need cache invalidation)
- load balancing: how to choose which proxy/cache
- availability: what if some proxies/caches fail

== web caching

many clients transfer same info, generates redundant server, network load, and clients experience high latency. 

want to place content closer to client for better client response time, happier users, reduced network load

works because exploits locality of reference

caching works very well up to limit, if large overlap in content but many unique reqs

/ caching with reverse proxies: cache data close to origin server to reduce server load. client thinks it's talking to origin server (server with content). doesn't work with dynamic content
/ caching with forward proxies: cache close to clients $->$ less network traffic, less latency, usually done by ISPs or corporate LANs. client configured to send HTTP requests to forward proxy
  - reduces traffic on ISP-1 access link, origin server, and backbone ISP
  - can make performance worse when your laptop moves to new location but tries to access cache back home

problems: "flash crowds" overwhelm servers, and more rich content (e.g. videos). and diversity causes low cache hit rates (25%--40%)

ucsd proxy: `webproxy.ucsd.edu:3128`

== proxy caches

have proxy also cache copies of documents to reduce latency, bandwidth to origin server, and share doc among all local users

how proxy knows if orig doc updated?

/ time-based: using `Last-Modified` in response and `If-Modified-Since` in req. ask origin server if it has since changed with HEAD request
  - 304 Not Modified if cache hit
  - 200 OK if cache miss
  - still issues a request per request, so doesn't cut down on requests, but does cut down bandwidth
  - depends on client and server agreeing on what time it is
  - last modified good for files, doesn't make sense for database
/ hash based: hash response contents, send hash and compare to hash of current contents. `Etag` in response, `If-None-Match` in request

== reverse proxies

web site overloaded. replicate site across mult machines (reverse proxies)

want to balance load across replicas so want to direct client to particular replica:
/ manual selection: have clients manually select replica (www1, www2, www3, etc)
  - some web page lists replicas by name or location, asks clients to click link to pick
/ DNS: multiple IPs, multiple machines. same DNS but diff IP for e/ replica
  - DNS server returns IP addr "round robin"
    - DNS lookup process will rotate multiple IP list, so client can just pick first item
  - exposes \# of replicas and their identities to client
/ load balancer: mult machines behind single IP addr
  - single proxy device forwards req to backend servers then fw res back to client
  - load balancer can immediately detect failing replica
  - can add/remove server without updating DNS
  - all servers need to be in same subnet
  - scales because forwards packets from one interface to the other, w/o doing any parsing, just rewriting parts of headers

== content distribution networks

/ content distribution networks (CDNs): proactive content replication. content provider (e.g. CNN) pushes content out from origin server. CDN replicates content on many servers around world
  - updates pushed to replicas when content changes

goals for replica selection:
- live, available server
- lowest load for load balancing
- nearest geographically / in round-trip time
- best performance
requires continuous monitoring

== akamai

replace `www` with `ak`

*TODO*: this feels like it'd be for a random trivia question on the final

end user
+ tries browser cache
+ then goes to OS to issue lookup for `ak.xyz.com`
  + goes to root name server
  + then queries for `ak.xyz.com` from `xyz.com`'s name server
  but instead of returning IP, it returns a CNAME pointing to akamai DNS name
+ so then it looks up akamai IP from DNS. gets an NS record to akamai high-level DNS servers, which looks at source IP of DNS request then select a cluster by guessing where IP is physically locating---they've built a map of IPs. sends client an NS record to low-level DNs servers for geographical region
+ low-level DNS servers select servers within cluster and send IP back to end user
+ then end user can connect to geographically local CDN node

challenges:
- coming up with IP geographic map is hard
  - collapse set of IPs as one vertex in graph
- need to estimate bandwidth etc from millions of clients to node, optimizing for many factors

dgfdhjdshkbj too eepy tired

key challenges for network performance: measuring paths is hard, traceroute only gives forward path, shortest path not necessarily best path. RTT estimation hard, variable network conditions, may not repr E2E perf. no access to client-perceived performance.

example approximation strats: geographic mapping, but hard to map IP to loc, and internet paths do not take shortest distance. active measurement, ping from all replicas to all routable prefixes. 500+ MB traffic per round. passive measurement: send fraction of clients to diff servers, observe performance, but some clients get bad perf.

mapping system: use equivalence classes of IP addrs experiencing sim perf. quantify how well they conn w e/o. collect, combine measurements w ping, traceroute, BGP routes, server logs (100+ TB logs per days), network latency, loss, thruput, connectivity.
then map e/ IP class to preferred server cluster based on perf, cluster health, etc. update every min (short 60s DNS TTLs accomplish this). map client req to server in cluster. load balancer selects specific server to e.g. maxx cache hit rate

failing hard drive on server suspends after finishing "in-progress" reqs. failed server: another server takes over for IP addr. low-level map updated quickly (load balancer). failed cluster/network path: high-level map updated quickly (ping/traceroute)

wtf is traceroute

== takeaways

- content distribution is hard. many diverse changing objects, clients all over the world
- moving content to client is key. (err like duh??) reduces latency improves thruput, reliability
- solutions have evolved: load balancing, reactive caching, to proactive content distribution networks

i feel like i have learned nothing from this

= lecture 15: 2PC

what if tritontube metadata store crashes? we are doomed.

replicate database. but could get inconsistent replicas

ACID:
/ atomicity: all parts of transaction execute, or none at all
/ consistency: transaction only commits if invariants are preserved
/ isolation: transaction executes as if executed by itself (other transactions will not interfere with this one)
/ durability: transaction effects not lost after execution

for multiple nodes:

/ straw man protocol: simple approach:
  + client tells transaction coordinator to go
  + transaction coordinator tells individual nodes what to do
    - on receiving messages, the nodes perform actions
  + transaction coordinator tells client OK
  what could go wrong
  - individual node can realize transaction is invalid
  - node may not exist anymore
  - node crashes before receiving msg
  - best-effort network to a node fails
  - transaction coordinator crashes in the middle of a transaction
/ _correct_ atomic commit protocol: (in two phase commit, "two" comes from two phases not two nodes. can work with any number of nodes)
  + client tells transaction coordinator to go
  + transaction coordinator tells relevant nodes to prepare
  + nodes reply yes or no
  + transaction coordinator can send message, either commit (if all say yes) or abort (if one says no)
    - abort message will make the node forget about it
    - commit message makes node commit
    - nodes keep state after preparing
  + transaction coordinator tells client OK or failed
  correct bc neither can commit until both agreed to commit
  
transaction coordinator and nodes have notion of committing. want 2 properties:
/ safety: if one commits, no one aborts. if one aborts, no one commits. if servers don't crash, all processes reach same decision
/ liveness: if no failures, A and B can commit, then action commits. if failures, reach a conclusion ASAP. if failures eventually repaired, every participant eventually reaches decision

2PC performance issues:
/ timeout: what if node is up but doesn't receive expected message because other node crashed or network down
  - when TC waits for yes/no from nodes, can safely abort after timeout
    - this is conservative, might be network problem. preserves correctness, sacrifices performance
  - nodes waiting for commit or abort from TC
    - if it had sent no, it can safely abort
    - if it had sent yes, cannot unilaterally abort/commit. so waiting forever
  / server termination protocol: consider node waiting for commit/abort from TC and had responded yes. node can ask other nodes for their status:
    - other node does not reply. no decision, wait for TC
    - other node received commit/abort from TC: agree with TC's decision
    - other node hasn't voted yet or voted no: both abort
      - TC hasn't yet decided to commit
    - other node voted yes: both must wait for TC because TC might've decided to abort due to timeout
  assumes all nodes are correct and won't lie. this is failure mode where assume network or nodes fail, but when they never operate incorrectly ("fail stop failure model", very simple, not appropriate for all systems but very common)
/ reboot: node crashed, rebooting, need to clean up. can't back out of commit if already decided
  - TC could crash after saying commit
  - node crashes after saying yes
  if all nodes knew state before crash, can use termination protocol (above), then use write-ahead log to record state to disk
  - there exists syscalls to block until actually written to disk instead of memory cache (e.g. Go `Sync()`)
  - if everything rebooted, reachable, TC can just check for commit record on disk and re-send action
  - if TC has no commit record on disk, abort: didn't send any commit messages
  - if nodes don't have yes record on disk, abort: haven't voted yes so TC hasn't committed yet
  - if yes record on disk, execute termination protocol. might block

if transaction coordinator is down, whole system is dead. this is why we will be talking about RAFT

/ two-phase commit (2PC): the above recovery protocol with non-volatile logging
  - safety: all hosts reach same decision, no commit until all say yes
  - liveness: if no failures and all say yes, then commit
    - but if failures 2PC might block
    - TC must be up to decide
  - doesn't tolerate faults well, must wait for repair
    - is building block for other larger scale fault tolerant approach, but not the only approach

coming up next: consistent lock step transactions. nodes elect new TC when a TC goes down

= lecture 16: RAFT

ideas:

- adapt 2PC to save data
- assume TC doesn't fail for now
- replicate data across multiple servers

network partitions: some network or host error prevents replicas from communicating w e/o
- 2PC only works if all nodes can be contacted
- but if some replicas cant be contacted

updatable data can have associated version number, so all server replicas have `(data, version)`
- suppose user can only reach some replicas

/ quorum-based protocols: tell client data version was updated after subset of servers get update
  - form *read quorum* of size $N_R$. contact them and read their versions. select highest as correct version
  - form *write quorum* of size $N_W$. contact them, inc highest version from that set, write new version to servers in write quorum
  like pidgeonhole principle, select quorum sizes cleverly so there's always non zero intersection between them

  not perfect because some nodes will go down. if too many go down, then intersection will go away. only relaxing requirements, not eliminating it
