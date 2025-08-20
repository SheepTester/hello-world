#set page(columns: 2, margin: 0.5in, paper: "us-letter")
#set raw(theme: "bw.tmTheme")
#set text(size: 7pt)

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

== quorums

/ quorum-based protocols: tell client data version was updated after subset of servers get update
  - form *read quorum* of size $N_R$. contact them and read their versions. select highest as correct version
  - form *write quorum* of size $N_W$. contact them, inc highest version from that set, write new version to servers in write quorum
  like pidgeonhole principle, select quorum sizes cleverly so there's always non zero intersection between them

  not perfect because some nodes will go down. if too many go down, then intersection will go away. only relaxing requirements, not eliminating it

  constraints, where $N =$ \# replicas, $N_R$ = \# replicas in read quorum, $N_W =$ \# replicas in write quorum

  to read/write to quorums, get corresponding locks on the quorum nodes

  / quorum consensus: write ops can be propagated in bg to replicas not in quorum, assumes eventual repair  of any network partition

  operations slowed by necessity of first gathering a quorum, but better than sending writes to all replicas. quorum sys lets you   only contact subset of replicas

  examples with 5 nodes:
  - 3 read, 3 write. balanced
  - 5 read, 1 write. writes are very fast, so writing a lot cheaper than reading
  - 1 read, 5 write. "*ROWA*" (read one, write all). so writes are expensive not only bc you need to contact all nodes but also have to prevent readers

  observations:
  - sys resilient to crash of $f <= N/2 -1$ servers
  - read lock doesn't block readers, multiple readers can concurrently read
    - each reader can read a different subset of nodes
  - two diff write ops cant proceed at same time, so write ops are serialized
  - reads don't overlap with writes bc intersection of read and write is nonempty ??? so every read op returns latest version written

== state machine
  
/ state machine replication: e/ machine starts in same initial state, executing same reqs (deterministic). requires consensus among all participants to execute in same order. produces same output

in RAFT, want odd number 3+ replicas. even is allowed but won't help you because need majority consensus. 5 is typical, but could have 7, 9, etc

components of a RAFT replica server:
/ state machine: represents state of system
/ replicated log: history of all commands, all updates to state machine. allows all replicas to be in sync. so all nodes would be within one update of e/o
/ consensus module: communicate with other nodes to make sure log is consistent. ensures proper log replication. gets consensus among other nodes to update log. like write quorum, doing write op on majority of nodes
  - leader reaches out, communicates with majority of nodes, agree on accepting new command, append to end of logs. once leader hears back from majority of nodes that they accepted update, it can apply it to state machine and respond to client. after client leaves, leader lets other nodes know that commit happened

// week 9 thu
== election

leader is nice because makes system easier to reason about. requires leader election step, but once you have leader, state space that you have to explore/reason about becomes much smaller
- leader elections are rare because failures are uncommon
- not all consensus protocols/approaches have leaders
- allows decomposition into normal operation and leader changes
- simplifies normal operation because no conflicts between nodes
- more efficient than leader-less approaches (e.g. raw quorum replication)
- obvious way to handle non-determinism (leader gets to choose)

server states: each either
/ leader: handles all client interactions, log replications. normally 1 leader
/ follower: completely passive. normally $n - 1$ followers
/ candidate: used to elect new leader
adding more nodes only makes it more fault tolerant, so 5 is common. doesn't add more capacity or improve performance

RPC operations:
/ AppendEntries(): leader uses this to push new operations to replicated state machines, and to tell other nodes it is leader
/ RequestVote(): used when system starts up, or leader fails to elect new leader, or leader unreachable due to network partition, to elect new leader

+ servers start out as followers
+ leaders send heartbeats (empty `AppendEntries` RPC) to maintain authority
+ if `electionTimeout` elapses w no RPCs (100--500ms), follower assumes leader has crashed, starts election (which makes it a candidate)
  - candidate can time out and start new election if no one wins election
  - could discover that rest of cluster has elected a different candidate, when it asks leader to elect them, so can step down back to follower
+ get majority (more than half, i.e. not plurality, tie is not a win) of votes and become leader
  - majority of all nodes, including those who failed. so if 2 of 5 nodes go down, still need 3 to agree
  - if leader discovers another node has become leader with higher term, it will step down back to follower

/ terms (epochs): time divided into terms, with election (either fails or 1 leader, or normal operation under 1 leader)
  - not a fixed interval. could be several days or a few min
  - each server maintains current term value
  - to identify obsolete info

during election, client requests are rejected or delayed. enforces strong consistency. but sometimes you are ok with accidentally losing info (e.g. shopping cart) so stuff like dynamoDB have weak consistency

=== elections

+ start election: inc current term, change to candidate state, vote for self
+ send `RequestVote` to all servers. retry until:
  - receive votes from majority of servers $->$ become leader, send `AppendEntries` heartbeats to all servers
  - receive RPC from valid leader $->$ return to follower state
  - no one wins election, election timeout elapses $->$ inc term, start new election
    - timeout is fixed (e.g. \~500 ms), but much larger than round trip between nodes (e.g. \~100 ms)

when node receives `RequestVote` RPC before they send their own out, for term bigger than their own, then they vote for that node

properties:
/ safety: max one winner (in a term) allowed
  - e/ server only votes once per term (persists on disk so if it crashes then reboots and gets another vote request for same term, it won't vote again)
  - 2 diff candidates can't get majorities in same term
/ liveness: some candidate must eventually win
  - e/ choose election timeouts randomly in $[T, 2T]$
  - one usually initiates, wins election before others start
  - works well if $T >>$ network RTT

want time for election to be bigger than time between heartbeats

when a leader of a previous term tries to send heartbeat to follower of future term, the follower will respond that it failed and that they're in a new term now, so the leader will be like ok, update its term, and become a follower

a term may have no leader (since each election attempt inc the term)

== logs

each log entry has index, term, command. stored on disk to survive crashes

entry *committed* if known to be stored on majority of servers. durable/stable, will eventually be executed by state machine. once committed, can tell client about it

normal operation:
+ client sends command to leader
+ leader appends command to log
+ leader sends `AppendEntries` RPCs to followers
+ new entry committed
+ leader passes command to state machine
+ sends result to client
+ leader piggybacks commitment to followers in later `AppendEntries`
+ followers pass committed commands to state machines

but what if follower crashed/slow? leader retries RPCs until they succeed

in common case, performance optimal: one successful RPC to any majority of servers

properties:
/ highly coherent: if log entries on diff servers have same index and term $->$ same command, and logs are also identical for all preceding entries. if given entry committed, all preceding also committed
  - won't have holes in logs
  - commands must be done in order
/ consistency check: `AppendEntries` has index and term of prev entry. follower must have matching entry; otherwise, it rejects. implements induction step, ensures coherency
/ safety requirement: once log entry applied to state machine, no other state machine may apply diff value for that log entry. $->$
  - leaders never overwrite entries in their logs
  - only entries in leader log can get committed
  - entries must be committed before applying to state machine
  i.e., committed (restrictions on commitment) $->$ present in future leader's logs (restrictions on leader election)

log inconsistency can happen due to leader changes. new leader's log is truth; immediately resume normal operation
- will eventually make follower's logs identical to leader's
- old leader may have left entries partially replicated
- multiple crashes may lead to many wrong log entries

elect candidate most likely to contain all committed entries:
- in `RequestVote`, candidates include index and term of last log entry
- voter denies vote if its own log is "more complete" (newer term or same term, higher index)
- leader will have "most complete" log among electing majority

when elected, it'll overwrite log entries in other nodes

leader decides entry is committed when:
+ entry stored on majority (not necessarily appended by that leader)
+ $>=1$ new entry from leader's term is also on majority

leader keeps `nextIndex` for e/ follower: index of next log entry to send to that follower, initialized to $1 +$ leader's last index
- if `AppendEntries` consistency check fails, dec `nextIndex`, try again

terms are used to detect stale leaders/candidates: each RPC has sender's term
- if sender's term < receiver $->$ receiver rejects RPC
- if receiver's term < sender $->$ receiver reverts to follower, updates term, processes RPC

client protocol:
+ send commands to leader.
  if leader unknown, contact any server to get redirected to leader
+ leader only responds after command logged, committed, executed
+ if request times out (e.g. bc leader crashed), client reissues command to new leader (after poss. redirect)
+ ensures *at-most-once semantics* even w leader failures: client should embed unique ID in each command, included in log entry, in case leader crashes between executing command and responding
