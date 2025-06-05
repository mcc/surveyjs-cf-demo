
/**
 * Calculates the expected HKID check digit based on the ID part.
 * HKID format: [A-Z]{1,2}\d{6} (e.g., A123456, AB123456)
 * The algorithm uses a weighted sum of character values modulo 11.
 *
 * @param {string} idPart - The ID part of the HKID (e.g., "A123456", "AB123456").
 * @returns {string|null} The calculated check digit ('0'-'9' or 'A'), or null if the ID part is invalid.
 */
function calculateHKIDCheckDigit(idPart) {
    // Clean and convert to uppercase for consistent processing
    idPart = (idPart || "").toUpperCase().trim();
    if (!idPart) return null; // No ID part provided

    let sum = 0;
    // Weights for the 8 characters of the HKID ID part
    // The calculation is (Value of char * Weight)
    // Weights are applied from left to right: 9, 8, 7, 6, 5, 4, 3, 2
    const weights = [9, 8, 7, 6, 5, 4, 3, 2];
    let currentWeightIndex = 0;

    // Iterate through each character of the ID part
    for (let i = 0; i < idPart.length; i++) {
        const char = idPart[i];
        let charValue;

        // Determine the numerical value of the character
        if (char >= 'A' && char <= 'Z') {
            // Letters A-Z map to 10-35 (ASCII code - 55)
            charValue = char.charCodeAt(0) - 55;
        } else if (char >= '0' && char <= '9') {
            // Digits 0-9 map to their numerical value
            charValue = parseInt(char, 10);
        } else {
            // Invalid character found in the ID part
            return null;
        }

        // Add to the sum using the current weight
        if (currentWeightIndex < weights.length) {
            sum += charValue * weights[currentWeightIndex++];
        } else {
            // Should not happen if ID part length is correct (7 or 8 characters)
            return null;
        }
    }

    // Calculate the remainder when sum is divided by 11
    const remainder = sum % 11;
    // The check digit value is 11 minus the remainder
    const checkDigitValue = 11 - remainder;

    // Map the calculated value to the actual check digit character
    if (checkDigitValue === 11) {
        return '0'; // If remainder is 0, check digit is '0'
    } else if (checkDigitValue === 10) {
        return 'A'; // If remainder is 1, check digit is 'A'
    } else {
        return checkDigitValue.toString(); // Otherwise, it's the digit itself
    }
}


// Register the composite question component for Document Information
Survey.ComponentCollection.Instance.add({
    name: "document-info", // Unique name for the component
    title: { // Display title in Survey Creator
        "default": "Document Information",
        "en": "Document Information",
        "zh-cn": "证件信息",
        "zh-hk": "證件資訊"
    },
    defaultQuestionTitle: { // Default title when added to a survey
        "default": "Document Information",
        "en": "Document Information",
        "zh-cn": "证件信息",
        "zh-hk": "證件資訊"
    },
    questionJSON: {
        "type": "panel", // Use a panel to group the related questions for logical structure
        "elements": [
            {
                "type": "dropdown",
                "name": "documentType",
                "title": {
                    "default": "Document Type",
                    "en": "Document Type",
                    "zh-cn": "证件类型",
                    "zh-hk": "證件類型"
                },
                "choices": [ // Options for document types
                    {
                        "value": "HKID",
                        "text": {
                            "default": "Hong Kong Identity Card (HKID)",
                            "en": "Hong Kong Identity Card (HKID)",
                            "zh-cn": "香港身份证 (HKID)",
                            "zh-hk": "香港身份證 (HKID)"
                        }
                    },
                    {
                        "value": "Passport",
                        "text": {
                            "default": "Passport",
                            "en": "Passport",
                            "zh-cn": "护照",
                            "zh-hk": "護照"
                        }
                    },
                    {
                        "value": "Other",
                        "text": {
                            "default": "Other",
                            "en": "Other",
                            "zh-cn": "其他",
                            "zh-hk": "其他"
                        }
                    }
                ],
                "defaultValue": "HKID", // Set HKID as default for easier demonstration
                "isRequired": true // Make document type selection mandatory
            },
            // HKID specific fields: visible only if 'documentType' is 'HKID'
            {
                "type": "text",
                "name": "hkidID",
                "title": {
                    "default": "HKID - ID Part (e.g., A123456 or AB123456)",
                    "en": "HKID - ID Part (e.g., A123456 or AB123456)",
                    "zh-cn": "香港身份证 - 号码部分 (例如: A123456 或 AB123456)",
                    "zh-hk": "香港身份證 - 號碼部分 (例如: A123456 或 AB123456)"
                },
                "visibleIf": "{documentType} = 'HKID'", // Conditional visibility
                "maxLength": 8, // Max length for HKID ID part (e.g., "AB123456")
                "isRequired": true, // Make this field mandatory when visible
                "validators": [
                    {
                        "type": "regex", // Basic format validation for the ID part
                        "text": {
                            "default": "HKID ID part should be 1-2 uppercase letters followed by 6 digits (e.g., A123456 or AB123456).",
                            "en": "HKID ID part should be 1-2 uppercase letters followed by 6 digits (e.g., A123456 or AB123456).",
                            "zh-cn": "香港身份证号码应为1-2个大写字母后跟6位数字 (例如: A123456 或 AB123456)。",
                            "zh-hk": "香港身份證號碼應為1-2個大寫字母後跟6位數字 (例如: A123456 或 AB123456)。"
                        },
                        "regex": "^[A-Z]{1,2}\\d{6}$" // Regex for HKID ID part format
                    }
                ]
            },
            {
                "type": "text",
                "name": "hkidCheckDigit",
                "title": {
                    "default": "HKID - Check Digit (e.g., A or 0-9)",
                    "en": "HKID - Check Digit (e.g., A or 0-9)",
                    "zh-cn": "香港身份证 - 校验码 (例如: A 或 0-9)",
                    "zh-hk": "香港身份證 - 校驗碼 (例如: A 或 0-9)"
                },
                "visibleIf": "{documentType} = 'HKID'", // Conditional visibility
                "maxLength": 1, // Check digit is always one character
                "isRequired": true, // Make this field mandatory when visible
                "validators": [
                    {
                        "type": "regex", // Basic format validation for the check digit
                        "text": {
                            "default": "HKID check digit must be a digit (0-9) or an uppercase 'A'.",
                            "en": "HKID check digit must be a digit (0-9) or an uppercase 'A'.",
                            "zh-cn": "香港身份证校验码必须是数字 (0-9) 或大写字母 'A'。",
                            "zh-hk": "香港身份證校驗碼必須是數字 (0-9) 或大寫字母 'A'。"
                        },
                        "regex": "^[0-9A]$" // Regex for check digit (0-9 or A)
                    },
                    {"type": "hkidCheckDigitValidator"} // Apply the custom HKID check digit validator
                ]
            },
            // General Document Number field: visible only if 'documentType' is NOT 'HKID'
            {
                "type": "text",
                "name": "documentNumber",
                "title": {
                    "default": "Document Number",
                    "en": "Document Number",
                    "zh-cn": "证件号码",
                    "zh-hk": "證件號碼"
                },
                "visibleIf": "{documentType} != 'HKID'", // Conditional visibility
                "isRequired": true, // Make this field mandatory when visible
                "placeholder": { // Placeholder text for general document number
                    "default": "Enter document number...",
                    "en": "Enter document number...",
                    "zh-cn": "输入证件号码...",
                    "zh-hk": "輸入證件號碼..."
                }
            }
        ]
    },
    inheritBaseProps: true // Allows the composite question to inherit properties like 'visibleIf'
});
