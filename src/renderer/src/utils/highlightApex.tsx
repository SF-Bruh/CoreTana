const KEYWORDS = new Set([
  'final', 'class', 'new', 'if', 'else', 'for', 'while', 'return', 'public',
  'private', 'protected', 'global', 'static', 'void', 'extends', 'implements',
  'try', 'catch', 'finally', 'throw', 'this', 'null', 'true', 'false',
  'override', 'virtual', 'abstract', 'interface', 'trigger', 'on', 'insert',
  'update', 'delete', 'upsert', 'break', 'continue'
])

const TYPES = new Set([
  'Integer', 'Long', 'Decimal', 'Double', 'String', 'Boolean', 'Date',
  'Datetime', 'Time', 'Id', 'List', 'Set', 'Map', 'Object', 'sObject',
  'Account', 'Contact', 'Opportunity', 'System'
])

const TOKEN_PATTERN = /(\/\/.*$)|('(?:[^'\\]|\\.)*')|(\b\d+\.?\d*\b)|([A-Za-z_]\w*)/gm

/** Very small, dependency-free Apex token colorizer for short code samples. */
export function highlightApex(code: string): JSX.Element {
  const nodes: JSX.Element[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = TOKEN_PATTERN.exec(code))) {
    if (match.index > lastIndex) {
      nodes.push(<span key={key++}>{code.slice(lastIndex, match.index)}</span>)
    }
    const [full, comment, string, number, word] = match
    if (comment) {
      nodes.push(
        <span key={key++} className="tok-comment">
          {comment}
        </span>
      )
    } else if (string) {
      nodes.push(
        <span key={key++} className="tok-string">
          {string}
        </span>
      )
    } else if (number) {
      nodes.push(
        <span key={key++} className="tok-number">
          {number}
        </span>
      )
    } else if (word && KEYWORDS.has(word)) {
      nodes.push(
        <span key={key++} className="tok-keyword">
          {word}
        </span>
      )
    } else if (word && TYPES.has(word)) {
      nodes.push(
        <span key={key++} className="tok-type">
          {word}
        </span>
      )
    } else {
      nodes.push(<span key={key++}>{full}</span>)
    }
    lastIndex = match.index + full.length
  }
  if (lastIndex < code.length) {
    nodes.push(<span key={key++}>{code.slice(lastIndex)}</span>)
  }

  return <>{nodes}</>
}
