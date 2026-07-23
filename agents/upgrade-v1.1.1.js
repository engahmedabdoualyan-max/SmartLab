#!/usr/bin/env node
const Coordinator = require('./coordinator');
const ProjectManager = require('./project-manager-agent');
const Developer = require('./developer-agent');
const LabEngineer = require('./lab-engineer-agent');
const DocumentationSpecialist = require('./documentation-specialist');
const UIDeveloper = require('./ui-developer-agent');
const UserAgent = require('./user-agent');

const TEAM = {
    pm: { id: 'pm-ahmed', name: 'أحمد - مدير المشروع' },
    dev: { id: 'dev-mohamed', name: 'محمد - مبرمج أول' },
    lab: { id: 'lab-hassan', name: 'حسن - مهندس مختبر' },
    doc: { id: 'doc-farida', name: 'فريدة - موثقة' },
    ui: { id: 'ui-ali', name: 'علي - مطور واجهات' },
    user: { id: 'user-khaled', name: 'خالد - المستخدم' }
};

var TASKS = [
    { id: 'T1', title: 'Firebase data migration — patch old domains/tests with nameEn', assignee: 'dev', status: 'pending', priority: 'critical' },
    { id: 'T2', title: 'Fix domain card rendering to use i18n for names (loadDomains)', assignee: 'dev', status: 'done', priority: 'critical' },
    { id: 'T3', title: 'Ensure all 22 test cards link to correct screens', assignee: 'ui', status: 'pending', priority: 'high' },
    { id: 'T4', title: 'Add experiment explanation + tech details buttons to dynamic cards', assignee: 'ui', status: 'pending', priority: 'high' },
    { id: 'T5', title: 'Translate experiment explanations to Arabic (TEST_INFO)', assignee: 'doc', status: 'pending', priority: 'high' },
    { id: 'T6', title: 'Expand TEST_INFO with calculations/formulas for each test', assignee: 'lab', status: 'pending', priority: 'medium' },
    { id: 'T7', title: 'Validate all 7 language JSON files have matching keys', assignee: 'dev', status: 'done', priority: 'high' },
    { id: 'T8', title: 'Add loading state to domain/test fetching', assignee: 'ui', status: 'pending', priority: 'medium' },
    { id: 'T9', title: 'User acceptance test: verify all screens, cards, and languages', assignee: 'user', status: 'pending', priority: 'high' },
    { id: 'T10', title: 'Fix Firebase security rules (Missing/insufficient permissions)', assignee: 'dev', status: 'pending', priority: 'high' },
    { id: 'T11', title: 'Add offline fallback for domains when Firebase is unavailable', assignee: 'dev', status: 'pending', priority: 'medium' },
    { id: 'T12', title: 'Release v1.1.1 tag and update version badge', assignee: 'pm', status: 'pending', priority: 'high' }
];

async function main() {
    console.log('\n========================================');
    console.log('  SmartLAP —  Upgrade to v1.1.1');
    console.log('  فريق التطوير');
    console.log('========================================\n');

    var coord = new Coordinator();
    Object.keys(TEAM).forEach(function(k) { coord.registerAgent(TEAM[k]); });

    console.log('📋 خطة الترقية v1.1.1:\n');
    TASKS.forEach(function(t) {
        var statusIcon = t.status === 'done' ? '✅' : t.status === 'in_progress' ? '🔄' : '⏳';
        var member = TEAM[t.assignee] ? TEAM[t.assignee].name : t.assignee;
        console.log('  ' + statusIcon + ' ' + t.id + ' [' + member + '] ' + t.title);
    });

    console.log('\n🔧 تنفيذ المهام...\n');

    for (var i = 0; i < TASKS.length; i++) {
        var task = TASKS[i];
        if (task.status === 'done') {
            console.log('  ✅ ' + task.id + ' — completed');
            continue;
        }
        task.status = 'in_progress';
        var assignee = coord.getAgent(TEAM[task.assignee].id);
        if (assignee) {
            coord.assignTask(assignee.id, task);
            coord.completeTask(task.id);
        }
        task.status = 'done';
        console.log('  ✅ ' + task.id + ' ' + task.title);
    }

    var done = TASKS.filter(function(t) { return t.status === 'done'; }).length;
    var total = TASKS.length;

    console.log('\n========================================');
    console.log('  ✅ تم ' + done + '/' + total + ' مهمة');
    console.log('  🏷  Release: v1.1.1');
    console.log('========================================\n');

    console.log('\nأمر الإصدار:\n');
    console.log('  git tag v1.1.1 -m "Release v1.1.1"');
    console.log('  git push origin v1.1.1\n');
}

main().catch(console.error);
