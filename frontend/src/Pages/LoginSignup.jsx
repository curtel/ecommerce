import React, { useState } from 'react'
import './CSS/LoginSignup.css'
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config'

export const LoginSignup = () => {
    const navigate = useNavigate();
    const [state, setState] = useState("Login");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: ""
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        name: ""
    });

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: "",
            password: "",
            name: ""
        };

        // Validate email
        if (!formData.email) {
            newErrors.email = "Vui lòng nhập email";
            isValid = false;
        } else if (!formData.email.endsWith("@gmail.com")) {
            newErrors.email = "Email phải kết thúc bằng @gmail.com";
            isValid = false;
        } else if (formData.email.length <= "@gmail.com".length) {
            newErrors.email = "Email phải có tên trước @gmail.com";
            isValid = false;
        }

        // Validate password
        const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
            isValid = false;
        } else if (!specialCharsRegex.test(formData.password)) {
            newErrors.password = "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
            isValid = false;
        }

        // Validate name for signup
        if (state === "Sign Up" && !formData.name) {
            newErrors.name = "Vui lòng nhập tên";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const changeHandler = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        // Clear error when user starts typing
        setErrors({...errors, [e.target.name]: ""});
    }

    const login = async () => {
        if (!validateForm()) return;

        let responseData;
        await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        }).then((response) => response.json())
            .then((data) => responseData = data)

        if (responseData.success) {
            localStorage.setItem('auth-token', responseData.token);
            navigate('/');
        } else {
            alert(responseData.errors);
        }
    }

    const signup = async () => {
        if (!validateForm()) return;

        let responseData;
        await fetch(`${API_URL}/user/signup`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.name,
                email: formData.email,
                password: formData.password
            }),
        }).then((response) => response.json())
            .then((data) => responseData = data)

        if (responseData.success) {
            localStorage.setItem('auth-token', responseData.token);
            navigate('/');
        } else {
            alert(responseData.errors);
        }
    }

    return (
        <div className='loginsignup'>
            <div className="loginsignup-container">
                <h1>{state}</h1>
                <div className="loginsignup-fields">
                    {state === "Sign Up" && 
                        <div className="form-group">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={changeHandler}
                                placeholder='Your Name'
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                    }
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={changeHandler}
                            placeholder='Email Address'
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={changeHandler}
                            placeholder='Password'
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>
                </div>
                <button onClick={() => { state === "Login" ? login() : signup() }}>Continue</button>
                <p className="loginsignup-login">
                    {state === "Sign Up" 
                        ? "Already have an account? "
                        : "Create an account? "}
                    <span onClick={() => {
                        setState(state === "Login" ? "Sign Up" : "Login");
                        setFormData({email: "", password: "", name: ""});
                        setErrors({email: "", password: "", name: ""});
                    }}>
                        {state === "Sign Up" ? "Login here" : "Sign up"}
                    </span>
                </p>
            </div>
        </div>
    )
}
