import type { Lesson } from './types'

export const variablesAndDataTypes: Lesson = {
  id: 'variables-and-data-types',
  title: 'Variables & Data Types',
  sections: [
    {
      heading: 'What a variable is in Apex',
      body: `Apex is strongly, statically typed. That means every variable is declared with an explicit type, and that type can never change. This is different from languages like JavaScript or Python where a variable can hold a number one moment and a string the next — in Apex, once you say something is an Integer, it's an Integer forever.`,
      code: `Integer numberOfAccounts = 5;\nString accountName = 'Acme Corp';\nBoolean isActive = true;`
    },
    {
      heading: 'The core primitive types',
      body: `You'll use these constantly:\n\n- Integer — whole numbers (32-bit)\n- Long — whole numbers when Integer isn't big enough (64-bit)\n- Decimal — numbers with a decimal point, used for anything involving money or precision\n- Double — floating point number, less precise than Decimal, faster\n- String — text, always in single quotes in Apex\n- Boolean — true or false\n- Date / Datetime / Time — calendar dates and timestamps\n- Id — a Salesforce record ID, an 18-character string with built-in validation`,
      code: `Decimal price = 19.99;\nDate today = Date.today();\nId accountId = '001000000000001AAA';`
    },
    {
      heading: 'Declaring and naming',
      body: `Apex variable names are case-insensitive when it comes to compilation — "accountName" and "AccountName" refer to the same variable, which will bite you if you're sloppy. Convention is camelCase for variables. You can declare without assigning, which gives the variable a default value of null (not zero, not empty string — null, unless you initialize it).`,
      code: `Integer count; // count is null right now, not 0\nString label = 'Ready';`
    },
    {
      heading: 'Constants with final',
      body: `Use the "final" keyword when a value should never be reassigned after it's set. This is how you write constants in Apex — there's no separate "const" keyword like in JavaScript.`,
      code: `final Integer MAX_BATCH_SIZE = 200;`
    },
    {
      heading: 'sObjects are not primitives',
      body: `An sObject variable (like Account or Contact) doesn't hold raw data the way a String or Integer does — it holds a structured record with fields you access by dot notation. You'll go deep on sObjects in a later module; for now, just know they're a different category of type from everything above.`,
      code: `Account acc = new Account(Name = 'Acme Corp');\nSystem.debug(acc.Name);`
    }
  ],
  questions: [
    {
      id: 'q1',
      type: 'mcq',
      prompt: 'What happens when you declare "Integer count;" without assigning a value?',
      choices: ['count is 0', 'count is null', 'It fails to compile', 'count is an empty string'],
      correctIndex: 1,
      explanation: 'Uninitialized primitive variables in Apex default to null, not zero — this trips up people coming from C-like languages.'
    },
    {
      id: 'q2',
      type: 'mcq',
      prompt: 'Which type would you use for a monetary value where precision matters?',
      choices: ['Double', 'Integer', 'Decimal', 'Long'],
      correctIndex: 2,
      explanation: 'Decimal is the right choice for money — Double is floating point and can introduce rounding errors you do not want near currency.'
    },
    {
      id: 'q3',
      type: 'mcq',
      prompt: 'Are Apex variable names case-sensitive?',
      choices: [
        'Yes, always',
        'No — "myVar" and "MyVar" are the same variable',
        'Only for String types',
        'Only inside classes'
      ],
      correctIndex: 1,
      explanation: 'Apex identifiers are case-insensitive. It still compiles if you mix cases, but consistent camelCase is the convention for a reason.'
    },
    {
      id: 'q4',
      type: 'mcq',
      prompt: 'How do you declare a constant in Apex?',
      choices: ['const Integer X = 5;', 'readonly Integer X = 5;', 'final Integer X = 5;', 'static Integer X = 5;'],
      correctIndex: 2,
      explanation: '"final" marks a variable as unreassignable after its initial value is set. "static" is a different concept (class-level vs instance-level).'
    },
    {
      id: 'code1',
      type: 'code',
      prompt:
        'Declare three variables: an Integer called "age" set to 30, a String called "name" set to \'Rookie\', and a Boolean called "isSparring" set to true. One line each.',
      starterCode: '// your code here\n'
    },
    {
      id: 'code2',
      type: 'code',
      prompt:
        'Declare a constant called MAX_RETRIES as an Integer equal to 3, using final. Then declare a Decimal called "price" without assigning it a value.',
      starterCode: '// your code here\n'
    }
  ]
}
