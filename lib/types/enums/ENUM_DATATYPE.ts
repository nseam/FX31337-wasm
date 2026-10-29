export enum ENUM_DATATYPE {
  TYPE_BOOL,      // bool
  TYPE_CHAR,      // char
  TYPE_COLOR,     // color
  TYPE_DATETIME,  // datetime
  TYPE_DOUBLE,    // double
  TYPE_FLOAT,     // float
  TYPE_INT,       // int
  TYPE_LONG,      // int64
  TYPE_SHORT,     // short
  TYPE_STRING,    // string
  TYPE_UCHAR,     // unsigned char
  TYPE_UINT,      // unsigned int
  TYPE_ULONG,     // uint64
  TYPE_USHORT,    // unsigned short
}

export function ENUM_DATATYPE_ToString(value: ENUM_DATATYPE): string {
  switch (value) {
    case ENUM_DATATYPE.TYPE_BOOL: return "BOOL";
    case ENUM_DATATYPE.TYPE_CHAR: return "CHAR";
    case ENUM_DATATYPE.TYPE_COLOR: return "COLOR";
    case ENUM_DATATYPE.TYPE_DATETIME: return "DATETIME";
    case ENUM_DATATYPE.TYPE_DOUBLE: return "DOUBLE";
    case ENUM_DATATYPE.TYPE_FLOAT: return "FLOAT";
    case ENUM_DATATYPE.TYPE_INT: return "INT";
    case ENUM_DATATYPE.TYPE_LONG: return "LONG";
    case ENUM_DATATYPE.TYPE_SHORT: return "SHORT";
    case ENUM_DATATYPE.TYPE_STRING: return "STRING";
    case ENUM_DATATYPE.TYPE_UCHAR: return "UCHAR";
    case ENUM_DATATYPE.TYPE_UINT: return "UINT";
    case ENUM_DATATYPE.TYPE_ULONG: return "ULONG";
    case ENUM_DATATYPE.TYPE_USHORT: return "USHORT";
    default: return "UNKNOWN";
  }
}