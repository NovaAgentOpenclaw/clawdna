import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Trophy, 
  GitMerge, 
  LineChart, 
  ArrowRight,
  Sparkles,
  Brain,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const features = [
  {
    icon: Brain,
    title: 'AI Agent Evolution',
    description: 'Watch neural networks evolve through genetic algorithms, adapting and improving with each generation.',
    color: 'neon',
  },
  {
    icon: GitMerge,
    title: 'Smart Breeding',
    description: 'Selectively breed agents with desirable traits to create increasingly powerful AI offspring.',
    color: 'purple',
  },
  {
    icon: LineChart,
    title: 'Real-time Analytics',
    description: 'Track fitness scores, trait distributions, and evolutionary progress with detailed charts.',
    color: 'cyan',
  },
  {
    icon: Trophy,
    title: 'Global Leaderboard',
    description: 'Compete with other researchers to breed the most capable AI agents in the ecosystem.',
    color: 'orange',
  },
];

const stats = [
  { label: 'Active Agents', value: '12,847' },
  { label: 'Generations', value: '892K' },
  { label: 'Researchers', value: '3,241' },
  { label: 'Best Fitness', value: '4.92' },
];

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-neon-500/5 via-transparent to-transparent" />
        <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="neon" size="md" className="mb-6">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Agent Evolution Platform
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary tracking-tight"
            >
              Evolve the Future of
              <br />
              <span className="text-gradient">Artificial Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto"
            >
              ClawDNA is a cutting-edge platform for evolving AI agents through genetic algorithms. 
              Breed, evolve, and compete to create the most capable agents.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/population">
                <Button size="lg" className="gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Exploring
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/breeding">
                <Button variant="secondary" size="lg">
                  Try Breeding
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl sm:text-4xl font-bold text-gradient">{stat.value}</p>
                  <p className="mt-1 text-sm text-text-muted">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="purple" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Everything you need to evolve
            </h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              Powerful tools and analytics to guide your agents through generations of evolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card hover className="h-full">
                    <CardContent className="pt-6">
                      <div className={cn(
                        'p-3 rounded-xl w-fit mb-4',
                        feature.color === 'neon' && 'bg-neon-500/10 text-neon-400',
                        feature.color === 'purple' && 'bg-accent-purple/10 text-accent-purple',
                        feature.color === 'cyan' && 'bg-accent-cyan/10 text-accent-cyan',
                        feature.color === 'orange' && 'bg-accent-orange/10 text-accent-orange',
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-text-secondary">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-neon-500/20">
            <CardContent className="py-16 px-8 text-center">
              <Zap className="w-12 h-12 text-neon-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Ready to start evolving?
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto mb-8">
                Join thousands of researchers breeding the next generation of AI agents. 
                Your journey to creating the perfect agent starts here.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/population">
                  <Button size="lg">
                    View Population
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="secondary" size="lg">
                    See Leaderboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

// Helper for className
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
