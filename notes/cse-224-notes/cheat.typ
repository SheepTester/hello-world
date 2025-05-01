#set page(columns: 2)
#set raw(theme: "bw.tmTheme")

= cheat sheet

/ packet: up to 64KB, usually 1500 bytes

TCP has reliable in-order delivery, retransmission, no duplicates, but high latency variance. UDP is the opposite.

layers:
- network layers: application, transport, network, link
- OSI network stack: application (7), presentation, session, transport, network, data link (logical link control, media access control), physical (1)

IPv4:
- host bits all $0$: network address
- host bits all $1$: broadcast address
- CIDR range a.b.c.d/$L$ has $L$ network bits, $32-L$ host bits

client:
- `socket`: create socket
- `connect`: blocks until connection, given IP and port. network activity begins
- `send`, `recv`
- `close`

server:
- `socket`: create socket
- `bind`: binds socket to port given, port
- `listen`: sets socket to passive, given backlog. network activity begins
- `accept`: blocks until connection. returns new socket
- `send`, `recv`
- `close`

/ `recv`/`read`: blocks until data available. returns bytes read, may be less than $n$. if 0, socket closed.
/ `send`/`write`: blocks until all data sent (can happen if send queue full). returns when data copied to send queue, not necessarily off machine yet

#place(
  bottom,
  scope: "parent",
  float: true,
```go
// client
conn, err := net.Dial("tcp", *host+":"+strconv.Itoa(*port))
defer conn.Close()
buffer := make([]byte, 4096)
_, err = conn.Write(buffer)
loop {
  bytesRead, err := conn.Read(buffer)
  if err == io.EOF {
    break
  }
}

// server
listener, err := net.Listen("tcp", *host+":"+strconv.Itoa(*port))
defer listener.Close()
for {
  conn, err := listener.Accept()
  go handleConnection(conn)
}

func handleConnection(directory string, conn net.Conn) {
  defer conn.Close()
}
```,
)