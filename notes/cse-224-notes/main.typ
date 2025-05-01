#set heading(numbering: "1.")
#set enum(numbering: "1.a.")

= lecture 1

at a glance:

+  Tue April 1: Intro, motivation, and logistics
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

