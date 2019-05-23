import React from 'react'
import { Form, Icon, Input, Upload, Radio, Button } from 'antd'

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
        const { getFieldDecorator } = this.props.form
        return (
            <>
                <Form.Item label="Patient picture">
                    {getFieldDecorator('patientPicture', {
                        valuePropName: 'fileList',
                        getValueFromEvent: this.normFile,
                    })(
                        <Upload name="logo" listType="picture">
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>,
                    )}
                </Form.Item>
                <Form.Item label="DNA Sequence">
                    {getFieldDecorator('dnaSequence', { rules: [] })
                        (
                            <Input />
                        )}
                </Form.Item>
                <Form.Item label="Blood Type">
                    {getFieldDecorator('bloodType', { rules: [] })
                        (
                            <Input />
                        )}
                </Form.Item>
                <Form.Item label="Full Name">
                    {getFieldDecorator('fullName', { rules: [] })
                        (
                            <Input />
                        )}
                </Form.Item>
                <Form.Item label="Date of Birth">
                    {getFieldDecorator('dateBirth', { rules: [] })
                        (
                            <Input />
                        )}
                </Form.Item>
                <Form.Item label="Sexe">
                    {getFieldDecorator('sexe')(
                        <Radio.Group>
                            <Radio.Button value="male">Male</Radio.Button>
                            <Radio.Button value="female">Female</Radio.Button>
                        </Radio.Group>
                    )}
                </Form.Item>
            </>
        )
    }
}

export default PartOne
