// Form validation utilities for EduVersePro

export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Password validation
  password: (password) => {
    return {
      isValid: password.length >= 6,
      message: password.length < 6 ? 'Password must be at least 6 characters long' : ''
    }
  },

  // Required field validation
  required: (value) => {
    return {
      isValid: value && value.trim().length > 0,
      message: !value || value.trim().length === 0 ? 'This field is required' : ''
    }
  },

  // Name validation
  name: (name) => {
    const nameRegex = /^[a-zA-Z\s'-]+$/
    return {
      isValid: nameRegex.test(name) && name.trim().length >= 2,
      message: name.trim().length < 2 ? 'Name must be at least 2 characters long' :
                !nameRegex.test(name) ? 'Name can only contain letters, spaces, hyphens, and apostrophes' : ''
    }
  },

  // Number validation
  number: (value, min = 0, max = Infinity) => {
    const num = parseFloat(value)
    return {
      isValid: !isNaN(num) && num >= min && num <= max,
      message: isNaN(num) ? 'Must be a valid number' :
                num < min ? `Must be at least ${min}` :
                num > max ? `Must be at most ${max}` : ''
    }
  },

  // Phone number validation
  phone: (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    const cleanPhone = phone.replace(/\D/g, '')
    return {
      isValid: phoneRegex.test(phone) && cleanPhone.length >= 10,
      message: cleanPhone.length < 10 ? 'Phone number must be at least 10 digits' :
                !phoneRegex.test(phone) ? 'Invalid phone number format' : ''
    }
  },

  // Date validation
  date: (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    return {
      isValid: !isNaN(date.getTime()) && date <= now,
      message: isNaN(date.getTime()) ? 'Invalid date format' :
                date > now ? 'Date cannot be in the future' : ''
    }
  },

  // URL validation
  url: (url) => {
    try {
      new URL(url)
      return { isValid: true, message: '' }
    } catch {
      return { isValid: false, message: 'Invalid URL format' }
    }
  },

  // File validation
  file: (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => { // Default 5MB
    const fileType = file.type
    const fileSize = file.size
    
    const isAllowedType = allowedTypes.length === 0 || allowedTypes.includes(fileType)
    const isValidSize = fileSize <= maxSize
    
    return {
      isValid: isAllowedType && isValidSize,
      message: !isAllowedType ? `File type ${fileType} is not allowed` :
                !isValidSize ? `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB` : ''
    }
  },

  // Select validation (for dropdowns)
  select: (value) => {
    return {
      isValid: value !== '' && value !== null && value !== undefined,
      message: 'Please select an option'
    }
  },

  // Checkbox validation
  checkbox: (checked) => {
    return {
      isValid: checked === true,
      message: 'This field must be checked'
    }
  }
}

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {}
  let isValid = true

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field]
    const value = formData[field]

    for (const rule of rules) {
      let result

      if (typeof rule === 'string') {
        // Built-in validator
        if (validators[rule]) {
          result = validators[rule](value)
        }
      } else if (typeof rule === 'function') {
        // Custom validator function
        result = rule(value)
      } else if (typeof rule === 'object') {
        // Validator with parameters
        const { type, ...params } = rule
        if (validators[type]) {
          result = validators[type](value, ...Object.values(params))
        }
      }

      if (result && typeof result === 'object' && !result.isValid) {
        errors[field] = result.message
        isValid = false
        break // Stop at first error for this field
      }
    }
  })

  return { isValid, errors }
}

// Real-time validation hook (for React components)
export const useValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = React.useState(initialValues)
  const [errors, setErrors] = React.useState({})
  const [touched, setTouched] = React.useState({})

  const validateField = (name, value) => {
    const fieldRules = validationRules[name]
    if (!fieldRules) return true

    for (const rule of fieldRules) {
      let result

      if (typeof rule === 'string') {
        if (validators[rule]) {
          result = validators[rule](value)
        }
      } else if (typeof rule === 'function') {
        result = rule(value)
      } else if (typeof rule === 'object') {
        const { type, ...params } = rule
        if (validators[type]) {
          result = validators[type](value, ...Object.values(params))
        }
      }

      if (result && typeof result === 'object' && !result.isValid) {
        setErrors(prev => ({ ...prev, [name]: result.message }))
        return false
      }
    }

    setErrors(prev => ({ ...prev, [name]: '' }))
    return true
  }

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, values[name])
  }

  const validateAll = () => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach(field => {
      const isFieldValid = validateField(field, values[field])
      if (!isFieldValid) {
        isValid = false
      }
    })

    return { isValid, errors }
  }

  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setValues
  }
}

// Common validation rule sets
export const commonRules = {
  login: {
    email: ['required', 'email'],
    password: ['required']
  },
  register: {
    name: ['required', 'name'],
    email: ['required', 'email'],
    password: ['required', 'password'],
    confirmPassword: [
      'required',
      (value, formData) => ({
        isValid: value === formData.password,
        message: 'Passwords do not match'
      })
    ]
  },
  userManagement: {
    name: ['required', 'name'],
    email: ['required', 'email'],
    role: ['required', 'select']
  },
  examCreation: {
    title: ['required'],
    classId: ['required', 'select'],
    duration: [
      { type: 'number', min: 1, max: 300 }
    ],
    totalMarks: [
      { type: 'number', min: 1, max: 1000 }
    ],
    scheduledDate: ['required', 'date']
  },
  feeManagement: {
    amount: [
      { type: 'number', min: 0 }
    ],
    description: ['required'],
    dueDate: ['required', 'date']
  }
}

export default validators