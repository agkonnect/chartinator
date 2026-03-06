
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMQL5Code(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required functions
  if (!code.includes('OnInit()') && !code.includes('OnInit(void)')) {
    errors.push('Missing OnInit() function');
  }
  if (!code.includes('OnCalculate(')) {
    errors.push('Missing OnCalculate() function');
  }

  // Buffer count validation
  const buffersPropMatch = code.match(/#property\s+indicator_buffers\s+(\d+)/);
  if (!buffersPropMatch) {
    errors.push('Missing #property indicator_buffers directive');
  } else {
    const declared = parseInt(buffersPropMatch[1], 10);
    const actual = (code.match(/SetIndexBuffer\s*\(/g) || []).length;
    if (actual !== declared) {
      errors.push(
        `Buffer mismatch: #property indicator_buffers=${declared} but found ${actual} SetIndexBuffer() calls`
      );
    }
  }

  // Strict mode
  if (!code.includes('#property strict')) {
    warnings.push('Missing #property strict — strongly recommended for MQL5');
  }

  // Sleep() ban
  if (/\bSleep\s*\(/.test(code)) {
    errors.push('Sleep() is forbidden in indicator code');
  }

  // Balanced braces
  let depth = 0;
  let inStr = false;
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    const n = code[i + 1];
    if (inLineComment) { if (c === '\n') inLineComment = false; continue; }
    if (inBlockComment) { if (c === '*' && n === '/') { inBlockComment = false; i++; } continue; }
    if (inStr) { if (c === '\\') { i++; continue; } if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; continue; }
    if (c === '/' && n === '/') { inLineComment = true; continue; }
    if (c === '/' && n === '*') { inBlockComment = true; continue; }
    if (c === '{') depth++;
    if (c === '}') depth--;
  }
  if (depth !== 0) {
    errors.push(`Unbalanced braces: ${depth > 0 ? 'missing closing' : 'extra closing'} brace(s) (depth=${depth})`);
  }

  // Return check
  if (!code.includes('return(rates_total)') && !code.includes('return rates_total')) {
    warnings.push('OnCalculate() should return rates_total at the end');
  }

  // rates_total guard
  if (!code.includes('rates_total < 2') && !code.includes('rates_total<2')) {
    warnings.push('Missing guard: if(rates_total < 2) return(0); in OnCalculate()');
  }

  // Handle validation
  const usesHandle = [
    'iMA(', 'iRSI(', 'iMACD(', 'iBands(', 'iATR(', 'iStochastic(',
    'iCCI(', 'iADX(', 'iWPR(', 'iAO(', 'iMomentum(', 'iDeMarker(',
  ].some((h) => code.includes(h));
  if (usesHandle && !code.includes('INVALID_HANDLE')) {
    warnings.push('Indicator handle created but INVALID_HANDLE check not found in OnInit()');
  }

  // IndicatorRelease check
  if (usesHandle && !code.includes('IndicatorRelease(')) {
    warnings.push('Indicator handle created but IndicatorRelease() not found in OnDeinit()');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function extractIndicatorName(code: string): string {
  // Try indicator_label1
  const labelMatch = code.match(/#property\s+indicator_label1\s+"([^"]+)"/);
  if (labelMatch) return labelMatch[1].trim();

  // Try INDICATOR_SHORTNAME set string
  const snMatch = code.match(/INDICATOR_SHORTNAME,\s*"([^"]+)"/);
  if (snMatch) return snMatch[1].trim();

  // Try first comment line
  const commentMatch = code.match(/\/\/\s*(.{3,50})/);
  if (commentMatch) return commentMatch[1].trim();

  return 'CustomIndicator';
}
