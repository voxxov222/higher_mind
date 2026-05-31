import React from 'react';
import { useLongPress } from '../hooks/useLongPress';
import { useHigherMind } from './HigherMindProvider';
import { motion } from 'motion/react';

interface ProjectableWidgetProps {
    id: string;
    type: string;
    componentName: string;
    children: React.ReactNode;
    data: any;
}

export const ProjectableWidget: React.FC<ProjectableWidgetProps> = ({ id, type, componentName, children, data }) => {
    const { addProjectedItem } = useHigherMind();

    const longPress = useLongPress(() => {
        addProjectedItem({ id, type, componentName, children });
    });

    return (
        <motion.div
            {...longPress}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
        >
            {children}
        </motion.div>
    );
};
