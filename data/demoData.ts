
import { CompanyCardData, User } from '../types';

export const mockUsers: User[] = [
    { id: 'user-1', name: 'You', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: 'user-2', name: 'Alex Chen', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
    { id: 'user-3', name: 'Maria Garcia', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
];

export const demoProjects: CompanyCardData[] = [
    {
        id: 'demo-project-nexxt',
        title: 'nexxt - Pro Business Copilot',
        description: 'This project contains the core concepts, branding guidelines, and development roadmap for the nexxt application itself. Use it as an example of how to structure your own projects.',
        category: 'Startup',
        members: [mockUsers[0], mockUsers[1]],
        assets: [
            {
                id: 'nexxt-readme',
                type: 'file',
                name: 'README.md',
                mimeType: 'text/markdown',
                size: 844,
                content: 'data:text/markdown;base64,IyBuZXh4dCAtIFBybyBCdXNpbmVzcyBDb3BpbG90CgpXZWxjb21lIHRvIHRoZSBtZXRhLXByb2plY3Qgd29ya3NwYWNlIGZvciBuZXh4dCEgVGhpcyBwcm9qZWN0IHNlcnZlcyBhcyBhIGNvbXByZWhlbnNpdmUgZGVtb25zdHJhdGlvbiBvZiB0aGUgYXBwbGljYXRpb24ncyBjb3JlIGNhcGFiaWxpdGllcywgc2hvd2Nhc2luZyBob3cgeW91IGNhbiBzdHJ1Y3R1cmUgeW91ciBvd24gYnVzaW5lc3MgdmVudHVyZXMuCgojIyBPdXIgVmlzaW9uClRvIGVtcG93ZXIgZW50cmVwcmVuZXVycyBhbmQgYnVzaW5lc3Mgb3duZXJzIGJ5IHByb3ZpZGluZyBhbiBBSS1wb3dlcmVkLCBpbnRlZ3JhdGVkIHdvcmtzcGFjZSB0aGF0IHN0cmVhbWxpbmVzIHRoZSBlbnRpcmUgYnVzaW5lc3MgbGlmZWN5Y2xlLCBmcm9tIGlkZWF0aW9uIGFuZCBtYXJrZXQgcmVzZWFyY2ggdG8gcHJvamVjdCBtYW5hZ2VtZW50IGFuZCBleGVjdXRpb24uCgojIyBIb3cgdG8gVXNlIFRoaXMgRGVtbwpFeHBsb3JlIHRoZSBmb2xkZXJzIGFuZCBkb2N1bWVudHMgd2l0aGluIHRoaXMgcHJvamVjdCB0byB1bmRlcnN0YW5kIGhvdyBuZXh4dCBjYW4gaGVscCB5b3Ugb3JnYW5pemUgYW5kIGFjY2VsZXJhdGUgeW91ciB3b3JrLiBVc2UgdGhlIEFJIENoYXQgdG8gYXNrIHF1ZXN0aW9ucyBhYm91dCB0aGUgZG9jdW1lbnRzLCBzdW1tYXJpemUgY29udGVudCwgb3IgZXZlbiBnZW5lcmF0ZSBuZXcgaWRlYXMgYmFzZWQgb24gdGhpcyBwcm9qZWN0J3MgY29udGV4dC4KCi0gKiovUHJvZHVjdCoqOiBDb250YWlucyBvdXIgY29yZSBwcm9kdWN0IHN0cmF0ZWd5LCBjb25jZXB0IGRvY3VtZW50cywgYW5kIGRldmVsb3BtZW50IHJvYWRtYXAuCi0gKiovQnJhbmRpbmcqKjogT3V0bGluZXMgb3VyIHZpc3VhbCBpZGVudGl0eSBhbmQgdG9uZSBvZiB2b2ljZS4=',
            },
            {
                id: 'nexxt-folder-product',
                type: 'folder',
                name: 'Product',
                children: [
                    {
                        id: 'nexxt-file-concept',
                        type: 'file',
                        name: 'Product Concept.md',
                        mimeType: 'text/markdown',
                        size: 1845,
                        content: 'data:text/markdown;base64,IyMgUHJvZHVjdCBDb25jZXB0OiBuZXh4dAoKIyMjIDEuIEhpZ2gtTGV2ZWwgVmlzaW9uCipubmV4eHQqKiBpcyBhbiBpbnRlZ3JhdGVkLCBBSS1uYXRpdmUgZW52aXJvbm1lbnQgZGVzaWduZWQgdG8gYmUgdGhlIGNlbnRyYWwgbmVydm91cyBzeXN0ZW0gZm9yIG1vZGVybiBidXNpbmVzc2VzIGFuZCBzdGFydHVwcy4gSXQgYnJpZGdlcyB0aGUgZ2FwIGJldHdlZW4gc3RyYXRlZ2ljIHBsYW5uaW5nIChyZXNlYXJjaCwgdmFsaWRhdGlvbikgYW5kIG9wZXJhdGlvbmFsIGV4ZWN1dGlvbiAocHJvamVjdCBtYW5hZ2VtZW50LCBkb2N1bWVudGF0aW9uKS4KCiMjIyAyLiBDb3JlIE1vZHVsZXMKCiMjIyMgYSkgUmVzZWFyY2ggVmlldwpUaGlzIGlzIHRoZSAiYmx1ZSBza3kiIGFuZCB2YWxpZGF0aW9uIHBoYXNlLiBVc2VycyBjYW4gZXhwbG9yZSBicm9hZCB0b3BpY3MgdG8gZGlzY292ZXIgdW50YXBwZWQgb3Bwb3J0dW5pdGllcyBvciBwZXJmb3JtIGEgZGVlcC1kaXZlIGFuYWx5c2lzIG9uIGEgc3BlY2lmaWMgbmljaGUuCi0gKipLZXkgRmVhdHVyZTogRXhwbG9yZSBJZGVhcyoqOiBHZW5lcmF0ZXMgYSBsaXN0IG9mIHBvdGVudGlhbCBidXNpbmVzcyBpZGVhcyB3aXRoIGJyaWVmIGRlc2NyaXB0aW9ucy4KLSBcKipLZXkgRmVhdHVyZTogQW5hbHl6ZSBOaWNoZSoqOiBBIGNvbXByZWhlbnNpdmUgcmVwb3J0IGluY2x1ZGluZyBtYXJrZXQgc2l6ZSwgdHJlbmRzLCBhdWRpZW5jZSBhbmFseXNpcywgY29tcGV0aXRpdmUgbGFuZHNjYXBlLCBTV09ULCBhbmQgYWN0aW9uYWJsZSBidXNpbmVzcyBpZGVhcywgYWxsIGJhY2tlZCBieSByZWFsLXRpbWUgd2ViIHNlYXJjaC4KLSBcKipPdXRjb21lKio6IFVzZXJzIGdhaW4gdGhlIGNvbmZpZGVuY2UgYW5kIGRhdGEgbmVlZGVkIHRvIHB1cnN1ZSBhIG5ldyB2ZW50dXJlLgoKIyMjIyBiKSBXb3JrIFZpZXcKVGhpcyBpcyB0aGUgZXhlY3V0aW9uIGFuZCBtYW5hZ2VtZW50IGh1Yi4gT25jZSBhbiBpZGVhIGlzIHZhbGlkYXRlZCBvciBpZiBhIHVzZXIgaGFzIGFuIGV4aXN0aW5nIGJ1c2luZXNzLCB0aGV5IGNhbiBjcmVhdGUgYSBwcm9qZWN0IGhlcmUuCi0gKipLZXkgRmVhdHVyZTogUHJvamVjdCBXb3Jrc3BhY2UqKjogQSBkZWRpY2F0ZWQgc3BhY2UgZm9yIGVhY2ggYnVzaW5lc3Mgb3IgaWRlYSwgY29udGFpbmluZyBhIGZpbGUgbWFuYWdlciwgZG9jdW1lbnQgdmlld3VyL2VkaXRvciwgYW5kIGNvbnRleHR1YWwgQUkgY2hhdC4KLSBcKipLZXkgRmVhdHVyZTogQUktUG93ZXJlZCBGaWxlIE1hbmFnZW1lbnQqKjogVGhlIEFJIGNhbiBjcmVhdGUsIGVkaXQsIHJlbmFtZSwgYW5kIG9yZ2FuaXplIGZpbGVzIG9uIGJlaGFsZiBvZiB0aGUgdXNlciB0aHJvdWdoIG5hdHVyYWwgbGFuZ3VhZ2UgY29tbWFuZHMuCi0gKipPdXRjb21lKio6IEEgY2VudHJhbGl6ZWQsIG9yZ2FuaXplZCwgYW5kIGludGVsbGlnZW50IHJlcG9zaXRvcnkgZm9yIGFsbCBwcm9qZWN0LXJlbGF0ZWQgYXNzZXRzLgoKIyMjMyAzLiBUYXJnZXQgQXVkaWVuY2UKLSBcKipFYXJseS1TdWdlIEVudHJlcHJlbmV1cnMqKjogSW5kaXZpZHVhbHMgd2l0aCBhbiBpZGVhIHdobyBuZWVkIHRvIGNvbmR1Y3QgbWFya2V0IHJlc2VhcmNoIGFuZCBmb3JtdWxhdGUgYSBidXNpbmVzcyBwbGFuLgotICoqU21hbGwgQnVzaW5lc3MgT3duZXJzKio6IE93bmVycyBsb29raW5nIHRvIHN0cmVhbWxpbmUgdGhlaXIgb3BlcmF0aW9ucywgY2VudHJhbGl6ZSBkb2N1bWVudHMsIGFuZCBsZXZlcmFnZSBBSSBmb3Igc3RyYXRlZ2ljIGluc2lnaHRzLgotICoqUHJvZHVjdCBNYW5hZ2VycyAmIENvbnN1bHRhbnRzKio6IFByb2Zlc3Npb25hbHMgd2hvIG5lZWQgdG8gcXVpY2tseSBhbmFseXplIG1hcmtldHMgYW5kIG1hbmFnZSBwcm9qZWN0IGRvY3VtZW50YXRpb24u',
                    },
                    {
                        id: 'nexxt-file-roadmap',
                        type: 'file',
                        name: 'Roadmap Q3.md',
                        mimeType: 'text/markdown',
                        size: 1100,
                        content: 'data:text/markdown;base64,IyBQcm9kdWN0IFJvYWRtYXA6IFEzIEZvY3VzCgpPdXIgcHJpbWFyeSBnb2FsIGZvciB0aGlzIHF1YXJ0ZXIgaXMgdG8gZGVlcGVuIHRoZSBBSSdzIGludGVncmF0aW9uIGludG8gdXNlciB3b3JrZmxvd3MsIG1ha2luZyBuZXh4dCBhbiBpbmRpc3BlbnNhYmxlIHBhcnRuZXIuCgojIyBUaGVtZSAxOiBXb3JrZmxvdyBBdXRvbWF0aW9uICYgSW50ZWxsaWdlbmNlCi0gKipbQ29tcGxldGVdIEZvdW5kYXRpb25hbCBBSSBDaGF0Kio6IEltcGxlbWVudCBjb250ZXh0dWFsIGNoYXQgZm9yIGJvdGggUmVzZWFyY2ggYW5kIFdvcmsgdmlld3MuCi0gKipbSW4gUHJvZ3Jlc3NdIEFJIEZpbGUgT3BlcmF0aW9ucyoqOiBFbmFibGUgdGhlIEFJIHRvIGNyZWF0ZSwgZWRpdCwgYW5kIG1hbmFnZSBmaWxlcyBiYXNlZCBvbiB1c2VyIHByb21wdHMuCi0gKipbUGxhbm5lZF0gRGlyZWN0IERvY3VtZW50IEFjdGlvbnMqKjogQWRkIEFFSS1wb3dlcmVkIGJ1dHRvbnMgZGlyZWN0bHkgaW4gdGhlIGRvY3VtZW50IHZpZXdlciAoZS5nLiwgIlN1bW1hcml6ZSIsICJFeHRyYWN0IEtleSBQb2ludHMiLCAiRmluZCBBY3Rpb24gSXRlbXMiKS4KLSBcKipbUGxhbm5lZF0gQ3Jvc3MtRG9jdW1lbnQgQW5hbHlzaSoqOiBBbGxvdyB1c2VycyB0byBzZWxlY3QgbXVsdGlwbGUgZG9jdW1lbnRzIGFuZCBhc2sgc3ludGhldGljIHF1ZXN0aW9ucyAoZS5nLiwgIkNvbXBhcmUgZmluYW5jaWFscyBmcm9tIFEyIGFuZCBRMyByZXBvcnRzIikKCiMjI1RoZW1lIDI6IFBsYXRmb3JtICYgSW50ZWdyYXRpb25zCi0gKipbSW4gUHJvZ3Jlc3NdIFJpY2ggVGV4dCBFZGl0b3IqKjogVXBncmFkZSB0aGUgcGxhaW4gdGV4dCBlZGl0b3IgdG8gYSBmdWxsIE1hcmtkb3duL1dZU0lXWUcgZWRpdG9yLgotICoqW1BsYW5uZWRdIEdvb2dsZSBEcml2ZSBJbnRlZ3JhdGlvbioqOiBBbGxvdyB1c2VycyB0byBsaW5rIHRvIGFuZCBpbXBvcnQgZmlsZXMgZGlyZWN0bHkgZnJvbSBHb29nbGUgRHJpdmUuCi0gKipbQmFja2xvZ10gTm90aW9uICYgU2xhY2sgSW50ZWdyYXRpb24qKjogQ29ubmVjdCBuZXh4dCB0byBwb3B1bGFyIHByb2R1Y3Rpdml0eSB0b29scyBmb3Igc2VhbWxlc3MgZGF0YSBmbG93LgoKIyMgVGhlbWUgMzogVXNlciBFeHBlcmllbmNlIEVuaGFuY2VtZW50cworICoqW0NvbXBsZXRlXSBFMkUgUHJvamVjdCBUcmFzaCAmIFJlY292ZXJ5Kio6IEltcGxlbWVudCBhIHRyYXNoIHN5c3RlbSBmb3IgcHJvamVjdHMuCi0gKipbSW4gUHJvZ3Jlc3NdIFVJIFBvbGlzaCoqOiBSZWZpbmUgYW5pbWF0aW9ucywgdHJhbnNpdGlvbnMsIGFuZCBvdmVyYWxsIGFlc3RoZXRpYy4=',
                    },
                ],
            },
            {
                id: 'nexxt-folder-branding',
                type: 'folder',
                name: 'Branding',
                children: [
                    {
                        id: 'nexxt-file-guidelines',
                        type: 'file',
                        name: 'Brand Guidelines.md',
                        mimeType: 'text/markdown',
                        size: 970,
                        content: 'data:text/markdown;base64,IyBuZXh4dDogQnJhbmQgR3VpZGVsaW5lcwoKIyMgMS4gVG9uZSBvZiBWb2ljZQpPdXIgdm9pY2UgaXMgcHJvZmVzc2lvbmFsLCBpbnNpZ2h0ZnVsLCBwcm9hY3RpdmUsIGFuZCBlbXBvd2VyaW5nLiBXZSBhcmUgYSB0cnVzdGVkIHBhcnRuZXIsIG5vdCBqdXN0IGEgdG9vbC4KLSBcKipEbzoqKiBVc2UgY2xlYXIsIGNvbmNpc2UgbGFuZ3VhZ2UuIEJlIGVuY291cmFnaW5nLiBPZmZlciBhY3Rpb25hYmxlIGFkdmljZS4KLSBcKipEb24ndDoqKiBVc2UgamFyZ29uLiBCZSBvdmVybHkgY2FzdWFsLiBNYWtlIGRlZmluaXRpdmUgcHJlZGljdGlvbnMuCgojIyAyLiBMb2dvICYgVHlwb2dyYXBoeQotICoqTG9nb3R5cGU6KiogVGhlIG9mZmljaWFsIGxvZ290eXBlIGlzICJuZXh4dCIgc2V0IGluIHRoZSAqKk9yYml0KiogZm9udC4KLSBcKipQcmltYXJ5IFR5cGVmYWNlOioqIFRoZSBVSSBhbmQgYm9keSB0ZXh0IHVzZSB0aGUgKipJbnRlcioqIGZvbnQgZmFtaWx5LgoKIyMgMy4gQ29sb3IgUGFsZXR0ZQotICoqUHJpbWFyeSBCcmFuZDoqKiBCbHVlIChgIzNiODJmNmApey0gVXNlZCBmb3IgcHJpbWFyeSBhY3Rpb25zLCBsaW5rcywgYW5kIGhpZ2hsaWdodHMuCi0gKipOZXV0cmFsczoqKiBBIG5nZSBvZiBncmF5cyBmcm9tIGRhcmsgKGAjMGEwYTBhYCkgdG8gbGlnaHQgKGAjZjVmNWY1YCkgaGFyZSB1c2VkIGZvciBiYWNrZ3JvdW5kcywgdGV4dCwgYW5kIFVJIGVsZW1lbnRzIHRvIGNyZWF0ZSBhIGNsZWFuLCBmb2N1c2VkIGludGVyZmFjZS4KLSBcKipBY2NlbnQgQ29sb3JzOioqIEdyZWVuLCBSZWQsIFllbGxvdywgYW5kIFB1cnBsZSBhcmUgdXNlZCBzcGFyaW5nbHkgZm9yIHN0YXR1cyBpbmRpY2F0b3JzIChlLmcuLCBTV09UIGFuYWx5c2lzLCBhbGVydHMpLg==',
                    },
                ],
            },
        ],
        goals: [
            {
                id: 'goal-nexxt-q3',
                title: 'Q3 Product Development',
                description: 'Focus on deepening AI integration and enhancing core platform features.',
                tasks: [
                    {
                        id: 'task-nexxt-1',
                        title: 'Finalize Q3 Roadmap',
                        description: 'Review and lock in the feature set for the Q3 development cycle. Ensure all stakeholders have provided input.',
                        status: 'Done',
                        priority: 'High',
                        assigneeId: 'user-1',
                        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        subtasks: [
                            { id: 'sub-n1-1', text: 'Gather feedback from marketing', completed: true },
                            { id: 'sub-n1-2', text: 'Get final sign-off from product lead', completed: true },
                        ],
                        attachments: [{ id: 'nexxt-file-roadmap', name: 'Roadmap Q3.md' }],
                    },
                    {
                        id: 'task-nexxt-2',
                        title: 'Implement Rich Text (WYSIWYG) Editor',
                        description: 'Upgrade the current plain text editor to a full-featured rich text editor to allow for better document formatting.',
                        status: 'In Progress',
                        priority: 'High',
                        assigneeId: 'user-2',
                        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                        subtasks: [
                            { id: 'sub-n2-1', text: 'Select a suitable editor library', completed: true },
                            { id: 'sub-n2-2', text: 'Integrate library into DocumentViewer', completed: false },
                            { id: 'sub-n2-3', text: 'Style the editor to match brand guidelines', completed: false },
                        ],
                        attachments: [],
                    },
                     {
                        id: 'task-nexxt-3',
                        title: 'Design Collaboration Features',
                        description: 'Create wireframes and mockups for multi-user collaboration features, including real-time editing and commenting.',
                        status: 'To Do',
                        priority: 'Medium',
                        assigneeId: 'user-1',
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        subtasks: [],
                        attachments: [],
                    }
                ]
            },
            {
                id: 'goal-nexxt-q4',
                title: 'Q4 Marketing & Growth',
                description: 'Prepare for a Q4 marketing push to increase user acquisition.',
                tasks: []
            }
        ]
    },
    {
        id: 'demo-project-ecocycle',
        title: 'EcoCycle Innovations',
        description: 'A sustainable tech startup developing smart recycling solutions for urban environments. Our mission is to incentivize recycling through a gamified mobile app and a network of IoT-enabled smart bins.',
        category: 'Startup',
        lastSummarized: new Date().toISOString(),
        members: [mockUsers[0], mockUsers[2]],
        assets: [
            {
                id: 'demo-folder-bp',
                type: 'folder',
                name: 'Business Plan',
                children: [
                    {
                        id: 'demo-file-execsummary',
                        type: 'file',
                        name: 'Executive Summary.md',
                        mimeType: 'text/markdown',
                        size: 1121,
                        content: 'data:text/markdown;base64,IyMgRXhlY3V0aXZlIFN1bW1hcnk6IEVjb0N5Y2xlIElubm92YXRpb25zCgojIyMgVGhlIFByb2JsZW0KVXJiYW4gcmVjeWNsaW5nIHJhdGVzIGFyZSBzdGFnbmF0aW5nIGR1ZSB0byBpbmNvbnZlbmllbmNlLCBsYWNrIG9mIGNsZWFyIGluY2VudGl2ZXMsIGFuZCBjb250YW1pbmF0aW9uIG9mIHJlY3ljbGFibGUgbWF0ZXJpYWxzLiBNdW5pY2lwYWxpdGllcyBzdHJ1Z2dsZSB3aXRoIGhpZ2ggd2FzdGUgbWFuYWdlbWVudCBjb3N0cyBhbmQgdW5tZXQgc3VzdGFpbmFiaWxpdHkgZ29hZHMuCgojIyMgT3VyIFNvbHV0aW9uCkVjb0N5Y2xlIGludHJvZHVjZXMgYW4gZWNvc3lzdGVtIG9mICoqSW9ULWVuYWJsZWQgc21hcnQgYmlucyoqIGFuZCBhICoqZ2FtaWZpZWQgY29uc3VtZXIgbW9iaWxlIGFwcCoqLiBPdXIgYmlucyBhdXRvbWF0aWNhbGx5IHNvcnQgbWF0ZXJpYWxzIGFuZCBtZWFzdXJlIHZvbHVtZSwgd2hpbGUgdGhlIGFwcCByZXdhcmRzIHVzZXJzIGZvciBjb3JyZWN0IHJlY3ljbGluZyBoYWJpdHMsIHByb3ZpZGVzIHJlYWwtdGltZSBkYXRhLCBhbmQgZWR1Y2F0ZXMgdGhlbSBvbiBzdXN0YWluYWJpbGl0eS4KCiMjIyBNYXJrZXQgT3Bwb3J0dW5pdHkKVGhlIGdsb2JhbCBzbWFydCB3YXN0ZSBtYW5hZ2VtZW50IG1hcmtldCBpcyBwcm9qZWN0ZWQgdG8gcmVhY2ggJDUuNDIgYmlsbGlvbiBieSAyMDI1LCBncm93aW5nIGF0IGEgQ0FHUiBvZiAxNS4xJS4gT3VyIGluaXRpYWwgdGFyZ2V0IGlzIHByb2dyZXNzaXZlLCB0ZWNoLWZyaWVuZGx5IG11bmljaXBhbGl0aWVzIGFuZCBsYXJnZSBjb3Jwb3JhdGUgY2FtcHVzZXMuCgojIyMgTWlzc2lvbgpUbyBjcmVhdGUgYSBjbGVhbmVyIGZ1dHVyZSBmb3IgY2l0aWVzIGJ5IG1ha2luZyByZWN5Y2xpbmcgYSByZXdhcmRpbmcgYW5kIHNlYW1sZXNzIHBhcnQgb2YgZGFpbHkgbGlmZS4gV2UgYWltIHRvIGluY3JlYXNlIHJlY3ljbGluZyByYXRlcyBieSAzMCMgaW4gb3VyIHBhcnRuZXIgY2l0aWVzIHdpdGhpbiB0aGUgZmlyc3QgdHdvIHllYXJzIG9mIG9wZXJhdGlvbi4=',
                    },
                    {
                        id: 'demo-file-financials',
                        type: 'file',
                        name: 'Financial Projections.csv',
                        mimeType: 'text/csv',
                        size: 106,
                        content: 'data:text/csv;base64,WWVhcixSZXZlbnVlLExpY2Vuc2luZyxQcm9maXQKMjAyNCw1MDAwMCwxNTAwMDAsLTEwMDAwMAoyMDI1LDI1MDAwMCwyMDAwMDAsNTAwMDAKMjAyNiw3NTAwMDAsNDAwMDAwLDM1MDAwMA==',
                    },
                ],
            },
            {
                id: 'demo-folder-mktg',
                type: 'folder',
                name: 'Marketing',
                children: [
                    {
                        id: 'demo-folder-brand',
                        type: 'folder',
                        name: 'Brand Assets',
                        children: [
                            {
                                id: 'demo-file-logo',
                                type: 'file',
                                name: 'Logo.svg',
                                mimeType: 'image/svg+xml',
                                size: 258,
                                content: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSIjNUNBMjU5IiBkPSJNNTAsNSBBNDUsNDUgMCAxLDAgNTAsOTUgQTQ1LDQ1IDAgMSwwIDUwLDUgWiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0zNS4zIDY2LjFsLTYuMyA2LjJjLTEuNSAxLjUtMS41IDQtLjEgNS41bDEzLjYgMTMuNmMxLjUgMS41IDQgMS41IDUuNSAwbDEwLjQtMTAuNGMtMy41LTMuMi03LjgtNS45LTExLjgtOS4yTDM1LjMgNjYuMXptMzkuOC0zMS4yTDU4LjUgMTguNGMtMS41LTEuNS00LTEuNS01LjUgMGwtNi4zIDYuM0w1Ny40IDM1bDE3LjctMTcuN2MxLjQtMS41IDEuNC00LS4xLTUuNHoiLz48cGF0aCBmaWxsPSIjQ0RFNUNGIiBkPSJNNTcuNCAzNUw0Ni43IDQ1LjdsLTEzLjYgMTMuNi0xMS4zIDExLjIgNi4zLTYuMyAxMS4zLTExLjMgMTMuNi0xMy42TDY4IDM1bC0xMC42LTEwLjZ6Ii8+PHBhdGggZmlsbD0iIzY2QkQ2QiIgZD0iTTM1LjMgNDUuOEwyNC4xIDU3LjEgMTIgNDVsOS45LTkuOUwzNS4zIDQ4LjVsLS4xLTIuN3ptMjcuOCAxMS43bC05LjkgOS45IDEzLjUgMTMuNSA5LjktOS45TDY0LjYgNTQuOWwtMS41IDIuNnoiLz48L3N2Zz4=',
                            },
                            {
                                id: 'demo-file-productshot',
                                type: 'file',
                                name: 'Product Mockup.png',
                                mimeType: 'image/png',
                                size: 5123,
                                content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARAAAADSCAMAAADi34d5AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEXUExURQAAANM3ItI3ItM3ItI3ItM3ItQ3ItM4ItM3ItM3ItM3ItM3ItM3ItM3ItI4Ig4ND9A2IBAOE9A3IdM3ItI3ItM3ItI3ItI3ItQ4I9M3ItM3ItI3ItM3ItM4ItM3IdM3ItI3ItA3ItM3ItI3ItI4ItI3ItM4ItI3ItI4ItM4ItM4I9I3ItM3ItM3ItA2IdM3ItM3ItM3ItI4ItI4I9M3ItM3IdM4ItM4I9E5JdM3ItI3IdM3ItI4ItM3ItI3ItI3ItA2IdM3ItM3ItI3ItM3ItI4ItM3ItM3ItI3IdM4I9Q4I9M4ItI4ItM4I9I3ItM4I9A2IdM4I9I3ItI3IdM4I9A3I////83+mHMAAAD8dFJOUwADARQfICEhJScoKissLS4yNDU2Nzg5Ojs8PT5AQUJDREVGR0hJSktMTU5PUFFSU1VWWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfa29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/1/W/2gAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQeSURBVHja7d3tUxtVFAfwN5lMQshBBDmAE4gISnEAxTlwBKeIIzgUHIpTxBGCU4TgFBEcClKc4jRFnKI4RRQnOUWnOH/+kf6Etr1p297E/Xw+h/WSvXvv+WfvPXt2k5vJJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmS9C9kMn9TkbP8DcjD/u1kMr9WyDB/M5Wz/M9Jb5k/D1mYf13JMr8/yDB/rZJlfh/K+f9cZJm/SsiwfzWZ5f4gysn+TWSZv1XI8P8imSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPC/k0ySv0TJ8P8imSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/IZkl/rDLyf5NZJm/VsjwfyGZJf6wy8n+TWSZv1bI8H8hmSX+sMvJ/k1kmb9WyPB/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',
                            },
                        ],
                    },
                    {
                        id: 'demo-file-social',
                        type: 'file',
                        name: 'Social Media Strategy.md',
                        mimeType: 'text/markdown',
                        size: 986,
                        content: 'data:text/markdown;base64,IyBTb2NpYWwgTWVkaWEgU3RyYXRlZ3kKCk91ciBzdHJhdGVneSBpcyB0byBidWlsZCBhIGNvbW11bml0eSBhcm91bmQgc3VzdGFpbmFiaWxpdHkgYW5kIHBvc2l0aW9uIEVjb0N5Y2xlIGFzIGEgbGVhZGVyIGluIHRoZSBlY28tdGVjaCBzcGFjZS4KCiMjIFBsYXRmb3JtIEZvY3VzCi0gKipJbnN0YWdyYW06KiogRm9yIHZpc3VhbCBzdG9yeXRlbGxpbmcsIHVzZXItZ2VuZXJhdGVkIGNvbnRlbnQgKHNoYXJpbmcgcmVjeWNsaW5nIHdpbnMpLCBhbmQgaW5mbHVlbmNlciBwYXJ0bmVyc2hpcHMuCi0gKipMaW5rZWRJbjoqKiBGb3IgQjJCIHJlYWNoIHRvIG11bmljaXBhbGl0aWVzLCBjb3Jwb3JhdGUgcGFydG5lcnMsIGFuZCBmb3Igc2hhcmluZyBpbmR1c3RyeSBpbnNpZ2h0cyBhbmQgY29tcGFueSBtaWxlc3RvbmVzLgotICoqVGlrVG9rL1JlZWxzOioqIFNob3J0LWZvcm0gdmlkZW8gY29udGVudCBzaG93aW5nIHRoZSBzbWFydCBiaW5zIGluIGFjdGlvbiwgcXVpY2sgcmVjeWNsaW5nIHRpcHMsIGFuZCBteXRoLWJ1c3RpbmcuCgojIyBDb250ZW50IFBpbGxhcnMxLiAgKipFZHVjYXRpb25hbDoqKiAiRGlkIHlvdSBrbm93PyIgZmFjdHMsIGhvdy10by1yZWN5Y2xlIGd1aWRlcywgZXhwbGFpbmluZyB0aGUgaW1wYWN0IG9mIGNvbnRhbWluYXRpb24uCiAgIDIKMi4gICoqSW5zcGlyYXRpb25hbDoqKiBIaWdobGlnaHRpbmcgY29tbXVuaXR5IGhlcm9lcywgc2hvd2Nhc2luZyB0aGUgcG9zaXRpdmUgZW52aXJvbm1lbnRhbCBpbXBhY3Qgb2Ygb3VyIHVzZXJzLgojIyBRMyBDYW1wYWlnbjogI0Vjb0N5Y2xlQ2hhbGxlbmdlCi0gKipHb2FsOioqIERyaXZlIGFwcCBkb3dubG9hZHMgYW5kIGluaXRpYWwgdXNlciBlbmdhZ2VtZW50LgotICoqTWNoYW5pYzoqKiBBIGVsay1sb25nIGNoYWxsZW5nZSB3aGVyZSB1c2VycyBlYXJuIGV4dHJhIHBvaW50cyBpbiB0aGUgYXBwIGZvciByZWN5Y2xpbmcgc3BlY2lmaWMgaXRlbSBjYXRlZ29yaWVzIGVhY2ggZGF5LgotICoqUHJvbW90aW9uOioqIFBhcnRuZXIgd2l0aCAzIGxvY2FsIGVjby1pbmZsdWVuY2VycyB0byBwcm9tb3RlIHRoZSBjaGFsbGVuZ2UuIFJ1biB0YXJnZXRlZCBhZHMgb24gSW5zdGFncmFtIGFuZCBGYWNlYm9vay4=',
                    },
                ],
            },
            {
                id: 'demo-folder-prod',
                type: 'folder',
                name: 'Product Development',
                children: [
                    {
                        id: 'demo-file-pitchdeck',
                        type: 'file',
                        name: 'Pitch Deck.pdf',
                        mimeType: 'application/pdf',
                        size: 13222,
                        content: 'data:application/pdf;base64,JVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=',
                    },
                    {
                        id: 'demo-file-video',
                        type: 'file',
                        name: 'Demo Video.mp4',
                        mimeType: 'video/mp4',
                        size: 8328,
                        content: 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAhJtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7au7u7u7u7u7u7u7u7u7u7u7u7u7u7u7a8Vz65/r+0yAAAC7G1vdmIAAAAYbG12aGQAAAAAzz4A/DPPgD8AAQAAAQAAAAAAAAAAAAAAAQAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAtx0cmFrAAAAXHRraGQAAAAHzz4A/DPPgD8AAAABAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAtg==',
                    },
                ],
            },
        ],
        goals: [
            {
                id: 'goal-eco-pilot',
                title: 'Pilot Program Launch',
                description: 'Successfully deploy the v2 smart bin prototype and mobile app in our partner municipality.',
                tasks: [
                    {
                        id: 'task-eco-1',
                        title: 'Finalize Smart Bin Prototype',
                        description: 'Complete the hardware and software integration for the v2 smart bin prototype. Needs to be ready for the pilot program.',
                        status: 'In Progress',
                        priority: 'Urgent',
                        assigneeId: 'user-3',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        subtasks: [
                            { id: 'sub-e1-1', text: 'Test sensor accuracy', completed: true },
                            { id: 'sub-e1-2', text: 'Integrate with mobile app backend', completed: false },
                        ],
                        attachments: [{ id: 'demo-file-productshot', name: 'Product Mockup.png' }],
                    },
                    {
                        id: 'task-eco-2',
                        title: 'Launch Q3 Social Media Campaign',
                        description: 'Execute the #EcoCycleChallenge campaign across Instagram and TikTok to drive app downloads for the pilot.',
                        status: 'To Do',
                        priority: 'High',
                        assigneeId: 'user-1',
                        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                        subtasks: [
                            { id: 'sub-e2-1', text: 'Onboard 3 eco-influencers', completed: false },
                            { id: 'sub-e2-2', text: 'Finalize ad creatives', completed: false },
                            { id: 'sub-e2-3', text: 'Schedule posts for the first week', completed: false },
                        ],
                        attachments: [{ id: 'demo-file-social', name: 'Social Media Strategy.md' }],
                    },
                    {
                        id: 'task-eco-3',
                        title: 'Update Financial Projections',
                        description: 'Revise the financial projections based on the new manufacturing costs for the v2 prototype.',
                        status: 'To Do',
                        priority: 'Medium',
                        subtasks: [],
                        attachments: [{ id: 'demo-file-financials', name: 'Financial Projections.csv' }],
                    },
                ]
            }
        ]
    },
];
