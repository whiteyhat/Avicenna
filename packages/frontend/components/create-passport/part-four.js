import React from 'react'
import { Form, Icon, Input, Switch, Upload, Radio, Button } from 'antd';

class PartOne extends React.Component {

    constructor(props) {
        super(props)
    }

    normFile = e => {
        if (Array.isArray(e)) {
            return e
        }
        return e && e.fileList
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <>
                <Form.Item label="Rule 1">
                    {getFieldDecorator('rule1', { rules: [] })
                        (
                            <Switch
                            checkedChildren={<Icon type="check" />}
                            unCheckedChildren={<Icon type="close" />}
                            defaultChecked
                            />
                        )} I confirm that this data is legitimately approved by me.
                </Form.Item>
                <Form.Item label="Rule 2">
                    {getFieldDecorator('rule2', { rules: [] })
                        (
                            <Switch
                            checkedChildren={<Icon type="check" />}
                            unCheckedChildren={<Icon type="close" />}
                            defaultChecked
                            />
                        )} I confirm that the patient or legal guardian has added a password to encryrpt this data.
                </Form.Item>
                <Form.Item label="Rule 3">
                    {getFieldDecorator('rule3', { rules: [] })
                        (
                            <Switch
                            checkedChildren={<Icon type="check" />}
                            unCheckedChildren={<Icon type="close" />}
                            defaultChecked
                            />
                        )} I agree to add my email and phone number to the passport in case of emergency.
                        <p>When you have finished entering data, allow the patient to type a password 
                        to encrypt his/her medical passport. Then press 'Create Passport'. You will have 
                        to sign with your keys the patient data using a WebLN provider</p>
                </Form.Item>
                <Form.Item label="Encrypt Passport">
                    {getFieldDecorator('dnaSequence', { rules: [] })
                        (
                            <Input.Password placeholder="input password" />
                        )}
                        <div>The accuracy of this record is the responsibility of the person and institution
                         entering the data. All data is is owned by the patient or legal guardian, who must 
                         keep the password to unencrypt his/her data. Once unencrypted, this passport can only 
                         be accessed via the QR code, or the associated link.</div>
                </Form.Item>
                 <Button type="primary" block>
                    Create Passport
                </Button>
                <span>&nbsp;&nbsp;</span>
            </>
        )
    }
}

export default PartOne
