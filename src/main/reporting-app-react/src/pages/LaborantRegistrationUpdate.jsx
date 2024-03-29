import React, { useState, useEffect } from 'react';
import { Checkbox, Label, Message, Button } from 'semantic-ui-react';
import * as Yup from 'yup';
import './LaborantRegistration.css'
import LaborantService from '../services/laborantService';

export default function LaborantRegistration() {

    const schema = Yup.object({
        firstName: Yup.string().required('Required'),
        lastName: Yup.string().required('Required'),
        hospitalIdNumber: Yup.string().matches(/^\d{7}$/, 'Hospital Id must be exactly 7 digits').required('Required'),
        username: Yup.string().min(5, 'Username must be at least 5 characters').required('Required'),
        password: Yup.string().min(5, 'Password must be at least 5 characters').required('Required'),
    });

    const [formData, setFormData] = useState({
        id: 0,
        firstName: "",
        lastName: "",
        hospitalIdNumber: "",
        username: "",
        password: "",
        isActive: true
    });

    const [formErrors, setFormErrors] = useState({});

    const [error, setError] = useState(null);

    const [buttonState, setButtonState] = useState(null);

    useEffect(() => {
        const loggedInClient = localStorage.getItem('loggedInClient');
        if (loggedInClient) {
            const clientData = JSON.parse(loggedInClient);
            setFormData({
                id: parseInt(clientData.id),
                firstName: clientData.firstName || "",
                lastName: clientData.lastName || "",
                hospitalIdNumber: clientData.hospitalIdNumber || "",
                username: clientData.username || "",
                password: clientData.password || "",
                isActive: clientData.isActive || true
            });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError(null);
        try {
            schema.validateSyncAt(name, { [name]: value });
            setFormErrors({ ...formErrors, [name]: undefined });
        } catch (validationError) {
            setFormErrors({ ...formErrors, [name]: validationError.message });
        }
    };

    const handleShowPassword = () => {
        setFormData({ ...formData, showPassword: !formData.showPassword });
    };

    const usernameCheck = () => {
        let laborantService = new LaborantService();
        laborantService.getLaborants().then(result => {

            let laborantsData = result.data;

            const usernameExists = laborantsData.some(laborant => laborant.username === formData.username && laborant.id !== formData.id);
            if (usernameExists) {
                setFormErrors({ ...formErrors, username: 'Username already exists' });
            }
        }).catch(error => {
            console.error('Error fetching laborants:', error);
        });
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await schema.validate(formData, { abortEarly: false });

            let laborantService = new LaborantService();

            setButtonState('Disable')

            try {
                const response = await laborantService.updateLaborant(formData);
                localStorage.setItem('loggedInClient', JSON.stringify(formData))

                setError('Success')

                setTimeout(() => {
                   setButtonState(null)
                   setError(null)
               }, 1000);

            } catch (error) {
                console.error('Error :', error);
            }
        } catch (validationError) {
            const errors = {};
            validationError.inner.forEach((error) => {
                errors[error.path] = error.message;
            });
            setFormErrors(errors);
            console.error('Validation error:', validationError.errors);
        }
    };

    return (
        <div className="laborant-registration-container">
            <div className="column-location">
                <label>
                    Hospital Id
                    <input name="hospitalIdNumber" value={formData.hospitalIdNumber} onChange={handleChange} />
                    {formErrors.hospitalIdNumber && (
                        <Label pointing basic color="red" content={formErrors.hospitalIdNumber}></Label>
                    )}
                </label>

                <label>
                    First Name
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
                    {formErrors.firstName && (
                        <Label pointing basic color="red" content={formErrors.firstName}></Label>
                    )}
                </label>

                <label>
                    Last Name
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                    {formErrors.lastName && (
                        <Label pointing basic color="red" content={formErrors.lastName}></Label>
                    )}
                </label>
            </div>
            <div className="column-location">
                <label>
                    Username
                    <input name="username" value={formData.username} onChange={handleChange} onBlur={usernameCheck} />
                    {formErrors.username && (
                        <Label pointing basic color="red" content={formErrors.username}></Label>
                    )}
                </label>

                <label>
                    Password
                    <input
                        type={formData.showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {formErrors.password && (
                        <Label pointing basic color="red" content={formErrors.password}></Label>
                    )}
                </label>

                <label>
                    Show Password
                    <Checkbox
                        checked={formData.showPassword}
                        onChange={handleShowPassword}
                    />
                </label>

                <Button positive style={{ marginLeft: '14px', marginTop: '15px', marginBottom: '10px' }} onClick={handleUpdate}>
                    Update
                </Button>
                {error === "Success" ? (
                    <Message positive>
                        <Message.Header>Success</Message.Header>
                        <p>Laborant Update Successful</p>
                    </Message>
                ) : (
                    error !== null ? (
                        <Message negative>
                            <Message.Header>Error</Message.Header>
                            <p>{error}</p>
                        </Message>
                    ) : null
                )}

            </div>
        </div>
    );

}
