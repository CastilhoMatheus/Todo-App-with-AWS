import Form from 'react-bootstrap/Form';
import { TaskData } from './types'

interface Props {
    taskData: TaskData;
    onChange: (task: TaskData) => void;
}

export function Task({
    taskData,
    onChange,
}: Props) {
    return (
        <div style={ {margin: '5px'} }>
            <Form.Check 
                type={'checkbox'}
                id={`${taskData.id}`}
                label={taskData.label}
                onChange={() => onChange(taskData)}
            />
        </div>
    )    
}