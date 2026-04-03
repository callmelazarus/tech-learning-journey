# Bits: Complete Overview

A bit (binary digit) is the **smallest unit of data in computing — a single 0 or 1**. Every piece of digital information — text, images, video, code, network traffic — is ultimately just a massive sequence of bits. Think of a bit like a light switch: it's either off (0) or on (1). Everything a computer does is built on top of this one simple concept.

## Key Points

- **Binary system.** Computers use base-2 (0 and 1) because transistors have two states: off and on. All other data types are built from combinations of bits.
- **Groups of bits form larger units.** 8 bits = 1 byte. Bytes are how we measure files, memory, and storage.
- **More bits = more possible values.** 1 bit has 2 possible values. 8 bits has 256. 32 bits has ~4.3 billion. The formula is 2ⁿ.
- **Two contexts.** "Bits" appear in two places: data storage (measured in bytes/KB/MB) and data transfer speed (measured in bits per second).
- **Bit vs Byte.** Bit = lowercase `b`. Byte = uppercase `B`. 100 Mbps (megabits) ≠ 100 MBps (megabytes). This distinction causes more confusion than almost anything else in computing.

## How Bits Represent Numbers

Bits use the binary (base-2) number system. Each position represents a power of 2, just like each position in decimal represents a power of 10.

```
Decimal (base 10):     4   2   7
                       ↓   ↓   ↓
                    4×10² + 2×10¹ + 7×10⁰
                    400  +  20   +  7  = 427

Binary (base 2):       1   1   0   1
                       ↓   ↓   ↓   ↓
                    1×2³ + 1×2² + 0×2¹ + 1×2⁰
                      8  +  4  +  0   +  1  = 13
```

```
Position values (right to left):

Bit position:   7    6    5    4    3    2    1    0
Power of 2:    128   64   32   16   8    4    2    1

Example: 01001101 in binary
           0    1    0    0    1    1    0    1
           0 +  64 + 0 +  0 +  8 +  4 +  0 +  1  = 77

So 01001101 = 77 in decimal
```

### Counting in Binary

```
Binary    Decimal    How to read it
──────    ───────    ──────────────
0000      0          all off
0001      1          one 1
0010      2          one 2
0011      3          one 2 + one 1
0100      4          one 4
0101      5          one 4 + one 1
0110      6          one 4 + one 2
0111      7          one 4 + one 2 + one 1
1000      8          one 8
1001      9          one 8 + one 1
1010      10         one 8 + one 2
1111      15         8+4+2+1 (maximum for 4 bits)
```

**Analogy:** Binary counting is like a row of light switches. When the rightmost switch is on, the value is 1. When you need to go higher, you flip the next switch to the left and reset the ones to the right — the same way decimal counting rolls over from 9 to 10.

## Bit Groupings

| Unit | Bits | Possible Values (2ⁿ) | Commonly Represents |
|---|---|---|---|
| 1 bit | 1 | 2 | True/false, yes/no, on/off |
| 4 bits (nibble) | 4 | 16 | One hex digit (0-F) |
| 8 bits (byte) | 8 | 256 | One ASCII character, one color channel |
| 16 bits | 16 | 65,536 | Unicode BMP character, short integer |
| 32 bits | 32 | ~4.3 billion | Integer, IPv4 address, single-precision float |
| 64 bits | 64 | ~18.4 quintillion | Large integer, double-precision float, memory address |
| 128 bits | 128 | ~3.4 × 10³⁸ | UUID, IPv6 address |
| 256 bits | 256 | ~1.16 × 10⁷⁷ | SHA-256 hash, encryption key |

**The 2ⁿ pattern is the most important concept.** Every time you add one bit, you *double* the number of possible values:

```
1 bit   →    2 values
2 bits  →    4 values
3 bits  →    8 values
4 bits  →   16 values
8 bits  →  256 values
10 bits → 1,024 values
16 bits → 65,536 values
32 bits → 4,294,967,296 values
```

## How Bits Represent Everything

### Text

Each character is mapped to a number, which is stored in binary.

```
ASCII (7-bit, 128 characters):
'A' = 65  = 01000001
'B' = 66  = 01000010
'a' = 97  = 01100001
'0' = 48  = 00110000
' ' = 32  = 00100000

The word "Hi" in bits:
'H' = 72  = 01001000
'i' = 105 = 01101001
"Hi" = 01001000 01101001 (16 bits = 2 bytes)
```

```
UTF-8 (variable length, 1-4 bytes):
'A'  → 1 byte   (01000001)
'é'  → 2 bytes  (11000011 10101001)
'中' → 3 bytes  (11100100 10111000 10101101)
'🎉' → 4 bytes  (11110000 10011111 10001110 10001001)
```

### Colors

A pixel's color is typically 3 bytes (24 bits) — one byte each for red, green, and blue.

```
Red channel:    8 bits → 0-255
Green channel:  8 bits → 0-255
Blue channel:   8 bits → 0-255
Total:         24 bits per pixel → 16.7 million colors

White:  RGB(255, 255, 255) = 11111111 11111111 11111111
Black:  RGB(0, 0, 0)       = 00000000 00000000 00000000
Red:    RGB(255, 0, 0)     = 11111111 00000000 00000000

32-bit color adds an alpha (transparency) channel:
RGBA(255, 0, 0, 128) = 11111111 00000000 00000000 10000000
```

### Numbers in Programming

```
Integer types (how languages store whole numbers):

Type       Bits   Range                          Use
──────────────────────────────────────────────────────
int8       8      -128 to 127                    Tiny counters
uint8      8      0 to 255                       Color channels, bytes
int16      16     -32,768 to 32,767              Limited integers
int32      32     -2.1B to 2.1B                  Default integer
uint32     32     0 to 4.3B                      IPv4, IDs
int64      64     ±9.2 quintillion               Large numbers, timestamps
float32    32     ~7 decimal digits precision     Graphics, games
float64    64     ~15 decimal digits precision    Finance, science
```

```
Why integer overflow happens:

uint8 max value: 11111111 = 255
Add 1:          100000000 = 256... but only 8 bits available!
Result:          00000000 = 0  ← wraps around!

This is why the Pac-Man kill screen happens at level 256 —
the level counter is an 8-bit integer.
```

## Bitwise Operations

Programming languages let you manipulate individual bits directly. These operations are fast because they map to single CPU instructions.

```js
// AND (&) — both bits must be 1
  1010
& 1100
------
  1000

// OR (|) — either bit can be 1
  1010
| 1100
------
  1110

// XOR (^) — exactly one bit must be 1
  1010
^ 1100
------
  0110

// NOT (~) — flip all bits
~ 1010
------
  0101

// Left shift (<<) — multiply by 2
  0101 << 1 = 1010  (5 → 10)
  0101 << 2 = 10100 (5 → 20)

// Right shift (>>) — divide by 2
  1010 >> 1 = 0101  (10 → 5)
  1010 >> 2 = 0010  (10 → 2)
```

### Practical Bitwise Patterns

```js
// Check if a number is even or odd (fastest method)
if (n & 1) { /* odd */ } else { /* even */ }
// Last bit is 1 → odd,  last bit is 0 → even

// Feature flags / permissions using bit masks
const READ    = 0b0001;  // 1
const WRITE   = 0b0010;  // 2
const EXECUTE = 0b0100;  // 4
const ADMIN   = 0b1000;  // 8

let permissions = READ | WRITE;          // 0011 = 3

// Check permission
if (permissions & EXECUTE) { }           // false (bit not set)

// Add permission
permissions = permissions | EXECUTE;     // 0111 = 7

// Remove permission
permissions = permissions & ~WRITE;      // 0101 = 5

// This is exactly how Unix file permissions work!
// chmod 755 → owner: 111 (rwx), group: 101 (r-x), others: 101 (r-x)
```

## Data Size Units

```
Bit-based (lowercase b):               Byte-based (uppercase B):
─────────────────────────               ──────────────────────────
1 Kb  = 1,000 bits                     1 KB  = 1,000 bytes = 8,000 bits
1 Mb  = 1,000,000 bits                 1 MB  = 1,000,000 bytes
1 Gb  = 1,000,000,000 bits             1 GB  = 1,000,000,000 bytes
1 Tb  = 1,000,000,000,000 bits         1 TB  = 1,000,000,000,000 bytes
```

### Bits vs Bytes: The Speed Confusion

Network speeds are measured in **bits** per second. File sizes are measured in **bytes**. This causes constant confusion.

```
Your internet plan: 100 Mbps (megabits per second)
Actual download speed: 100 ÷ 8 = 12.5 MBps (megabytes per second)

A 1 GB file at 100 Mbps:
1 GB = 8 Gb = 8,000 Mb
8,000 Mb ÷ 100 Mbps = 80 seconds

Why the difference?
  ISPs advertise in bits (bigger number, looks faster).
  Your browser shows download speed in bytes (more meaningful for files).
  Divide by 8 to convert bits → bytes.
```

### SI vs Binary Units

```
SI (decimal, powers of 1000):        Binary (powers of 1024):
──────────────────────────────       ──────────────────────────
1 KB  = 1,000 bytes                  1 KiB = 1,024 bytes
1 MB  = 1,000,000 bytes              1 MiB = 1,048,576 bytes
1 GB  = 1,000,000,000 bytes          1 GiB = 1,073,741,824 bytes
1 TB  = 1,000,000,000,000 bytes      1 TiB = 1,099,511,627,776 bytes

This is why your "500 GB" hard drive shows as 465 GB in your OS:
  Manufacturer: 500,000,000,000 bytes ÷ 1,000,000,000 = 500 GB (SI)
  OS reports:   500,000,000,000 bytes ÷ 1,073,741,824 = 465 GiB (binary)
```

## Bits in the Real World

```
Content                    Approximate Size
──────────────────────────────────────────────
A single boolean           1 bit
An ASCII character          8 bits (1 byte)
A Unicode emoji            32 bits (4 bytes)
A pixel (24-bit color)     24 bits (3 bytes)
An IPv4 address            32 bits (4 bytes)
A UUID                    128 bits (16 bytes)
A 10 MP photo               ~30 Mb (~4 MB)
A 3-min MP3 song            ~24 Mb (~3 MB)
A 2-hour 1080p movie       ~32 Gb (~4 GB)
A 1 TB hard drive          ~8 trillion bits
```

## Common Pitfalls

- **Confusing bits and bytes.** Your 200 Mbps internet connection downloads at ~25 MBps. Divide by 8. This is the single most common source of confusion in computing.
- **Integer overflow.** A 32-bit integer maxes out at ~2.1 billion (signed) or ~4.3 billion (unsigned). If your app has user IDs, view counts, or timestamps that could exceed this, use 64-bit integers.
- **Assuming 1 character = 1 byte.** True for ASCII, but UTF-8 characters can be 1-4 bytes. A 100-character string with emojis could be 200+ bytes.
- **Ignoring bit depth in media.** 8-bit color gives 256 shades per channel. 10-bit gives 1,024. The difference is visible in gradients — 8-bit shows banding, 10-bit is smooth. Relevant for photography and video work.
- **Floating point precision.** A 64-bit float has ~15 digits of precision. `0.1 + 0.2 = 0.30000000000000004` because 0.1 can't be represented exactly in binary. Use integers (cents instead of dollars) for financial calculations.

## Practical Applications

- **Permissions:** Unix file permissions are 9 bits — 3 groups of 3 (rwx). `chmod 755` is `111 101 101` in binary.
- **Feature flags:** Store multiple boolean flags in a single integer using bitmasks. One 32-bit int holds 32 independent on/off flags.
- **Networking:** IPv4 is 32 bits (4.3 billion addresses — not enough). IPv6 is 128 bits (340 undecillion addresses — enough for every atom on Earth).
- **Cryptography:** Key strength is measured in bits. AES-256 uses a 256-bit key with 2²⁵⁶ possible combinations — more than atoms in the observable universe.
- **Color depth:** 8-bit per channel (24-bit RGB) gives 16.7 million colors. 10-bit per channel (30-bit) gives 1.07 billion — standard for HDR displays.

## References

- [Wikipedia: Bit](https://en.wikipedia.org/wiki/Bit)
- [Khan Academy: Binary Number System](https://www.khanacademy.org/computing/computers-and-internet/xcae6f4a7ff015e7d:digital-information/xcae6f4a7ff015e7d:binary-numbers/a/bits-and-binary)
- [MDN: Bitwise Operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators)
- [IEEE 754: Floating Point Standard](https://en.wikipedia.org/wiki/IEEE_754)

---

## Greater Detail

### Advanced Concepts

- **Endianness:** Multi-byte values can be stored with the most significant byte first (big-endian) or least significant byte first (little-endian). The number `0x0102` is stored as `01 02` in big-endian and `02 01` in little-endian. x86 processors use little-endian; network protocols use big-endian ("network byte order"). This matters when reading binary files or network packets.
- **Bit Manipulation Tricks:** `n & (n - 1)` clears the lowest set bit — used to count set bits efficiently. `n & (-n)` isolates the lowest set bit. These tricks power algorithms in competitive programming and systems code.
- **Parity and Error Detection:** Adding a parity bit (sum of bits mod 2) lets you detect single-bit errors in transmission. More sophisticated error-correcting codes (Hamming, Reed-Solomon) can detect *and fix* bit errors — this is how data survives noisy channels and degrading storage media.
- **Bit Fields in C/C++:** Structs can define members with specific bit widths: `unsigned int flags : 4;` allocates exactly 4 bits. Used in hardware drivers, protocol headers, and anywhere memory layout matters at the bit level.
- **Quantum Bits (Qubits):** Classical bits are 0 or 1. Qubits exist in a superposition of both states simultaneously. This allows quantum computers to explore many solutions in parallel, but qubits are fragile and error-prone — a fundamentally different computing paradigm still in early stages.