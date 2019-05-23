import React from 'react'
import PatientReport from './patient-report'

class PartTwo extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <>
               <PatientReport form={this.props.form} />
               <hr/>
               {/* ALLERGIES */}
               {/* IMMUNISATIONS */}
               {/* SOCIAL HISTORY */}
            </>
        )
    }
}

export default PartTwo
