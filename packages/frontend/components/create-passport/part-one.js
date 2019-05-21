import React from 'react'
import { Form, Icon, Input, Upload, Radio, Button } from 'antd';

class PartOne extends React.Component {

    constructor(props) {
        super(props)
    }

    normFile = e => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e
        }
        return e && e.fileList
    }

    render() {
        const { getFieldDecorator } = this.props.form;
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

            // <Scope path="details">
            //     <div className="form-group row">
            //         <label htmlFor="details.picture" className="col-sm-2 col-form-label">Patient Picture</label>
            //         <Input name="picture" id="picture" type="file" />
            //     </div>
            //     <div className="form-group row">
            //         <label htmlFor="details.dna" className="col-sm-2 col-form-label">DNA Sequence</label>
            //         <Input className="form-control col-sm-10" name="dna" type="text" />
            //     </div>
            //     <div className="form-group row">
            //         <label htmlFor="details.bloodType" className="col-sm-2 col-form-label">Blood Type</label>
            //         <Input className="form-control col-sm-10" name="bloodType" type="text" />
            //     </div>
            //     <div className="form-group row">
            //         <label htmlFor="details.fullName" className="col-sm-2 col-form-label">Full Name</label>
            //         <Input className="form-control col-sm-10" name="fullName" type="text" />
            //     </div>
            //     <div className="form-group row">
            //         <label htmlFor="details.birth" className="col-sm-2 col-form-label">Date of Birth</label>
            //         <Input className="form-control col-sm-10" name="birth" type="date" />
            //     </div>
            //     <div className="form-group row">
            //         <label htmlFor="details.sexe" className="col-sm-2 col-form-label">Sexe</label>
            //         <Select className="form-control col-sm-10" name="sexe" options={this.getSexeValues()} />
            //     </div>
            // </Scope>
        )
    }

    getSexeValues = () => {
        return [
            {
                id: "male",
                title: "Male"
            },
            {
                id: "female",
                title: "Female"
            }
        ];
    }

}

export default PartOne
